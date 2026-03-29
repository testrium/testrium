package com.testrium.manager.controller;

import com.testrium.manager.dto.AddProjectMemberRequest;
import com.testrium.manager.dto.ProjectMemberDTO;
import com.testrium.manager.dto.UserDTO;
import com.testrium.manager.entity.ProjectMember;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.ProjectMemberRepository;
import com.testrium.manager.repository.ProjectRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/project-members")
public class ProjectMemberController {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all members of a project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectMemberDTO>> getProjectMembers(@PathVariable Long projectId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<ProjectMemberDTO> memberDTOs = members.stream().map(member -> {
            User user = userRepository.findById(member.getUserId())
                    .orElse(null);
            if (user != null) {
                return new ProjectMemberDTO(
                    member.getId(),
                    project.getId(),
                    project.getName(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    member.getRole()
                );
            }
            return null;
        }).filter(dto -> dto != null).collect(Collectors.toList());

        return ResponseEntity.ok(memberDTOs);
    }

    /**
     * Get all projects a user is member of
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectMemberDTO>> getUserProjects(@PathVariable Long userId) {
        System.out.println("getUserProjects called for userId: " + userId);
        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        System.out.println("Found " + memberships.size() + " memberships for user " + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProjectMemberDTO> memberDTOs = memberships.stream().map(member -> {
            Project project = projectRepository.findById(member.getProjectId())
                    .orElse(null);
            if (project != null) {
                System.out.println("  - Member of project: " + project.getId() + " - " + project.getName());
                return new ProjectMemberDTO(
                    member.getId(),
                    project.getId(),
                    project.getName(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    member.getRole()
                );
            }
            return null;
        }).filter(dto -> dto != null).collect(Collectors.toList());

        System.out.println("Returning " + memberDTOs.size() + " project memberships");
        return ResponseEntity.ok(memberDTOs);
    }

    /**
     * Get all users NOT in a project (for adding members)
     */
    @GetMapping("/project/{projectId}/available-users")
    public ResponseEntity<List<UserDTO>> getAvailableUsers(@PathVariable Long projectId) {
        List<ProjectMember> existingMembers = projectMemberRepository.findByProjectId(projectId);
        List<Long> memberUserIds = existingMembers.stream()
                .map(ProjectMember::getUserId)
                .collect(Collectors.toList());

        List<User> allUsers = userRepository.findAll();
        List<UserDTO> availableUsers = allUsers.stream()
                .filter(user -> !memberUserIds.contains(user.getId()))
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(availableUsers);
    }

    /**
     * Add users to a project (supports multiple users)
     */
    @PostMapping("/project/{projectId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> addMembersToProject(
            @PathVariable Long projectId,
            @RequestBody AddProjectMemberRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<ProjectMemberDTO> addedMembers = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long userId : request.getUserIds()) {
            try {
                // Check if user exists
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Check if already a member
                if (projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
                    errors.add("User " + user.getUsername() + " is already a member");
                    continue;
                }

                // Add member
                ProjectMember member = new ProjectMember(projectId, userId, request.getRole());
                member = projectMemberRepository.save(member);

                addedMembers.add(new ProjectMemberDTO(
                    member.getId(),
                    project.getId(),
                    project.getName(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    member.getRole()
                ));
            } catch (Exception e) {
                errors.add("Error adding user " + userId + ": " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("addedMembers", addedMembers);
        response.put("errors", errors);
        response.put("message", addedMembers.size() + " user(s) added successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Remove a user from a project
     */
    @DeleteMapping("/{memberId}")
    @Transactional
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable Long memberId) {
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Project member not found"));

        projectMemberRepository.delete(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Member removed successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Update member role
     */
    @PutMapping("/{memberId}/role")
    public ResponseEntity<ProjectMemberDTO> updateMemberRole(
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {

        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Project member not found"));

        member.setRole(request.get("role"));
        member = projectMemberRepository.save(member);

        User user = userRepository.findById(member.getUserId()).orElseThrow();
        Project project = projectRepository.findById(member.getProjectId()).orElseThrow();

        ProjectMemberDTO dto = new ProjectMemberDTO(
            member.getId(),
            project.getId(),
            project.getName(),
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            member.getRole()
        );

        return ResponseEntity.ok(dto);
    }
}
