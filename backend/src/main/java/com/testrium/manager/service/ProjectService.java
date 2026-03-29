package com.testrium.manager.service;

import com.testrium.manager.dto.CreateProjectRequest;
import com.testrium.manager.dto.ProjectDTO;
import com.testrium.manager.dto.UpdateProjectRequest;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.ProjectRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<ProjectDTO> getAllProjects(String email) {
        User user = getUserByEmail(email);
        System.out.println("getAllProjects called for user: " + email + ", role: " + user.getRole());

        // Return all projects for all users
        // Frontend will filter based on project membership for regular users
        List<Project> projects = projectRepository.findAll();
        System.out.println("Returning all projects, count: " + projects.size());
        return projects.stream()
                .map(this::toProjectDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByStatus(String email, String status) {
        User user = getUserByEmail(email);
        List<Project> projects = projectRepository.findByUserIdAndStatus(user.getId(), status);
        return projects.stream()
                .map(this::toProjectDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(String email, Long projectId) {
        User user = getUserByEmail(email);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return toProjectDTO(project);
    }

    public ProjectDTO createProject(String email, CreateProjectRequest request) {
        User user = getUserByEmail(email);

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setUser(user);

        project = projectRepository.save(project);
        return toProjectDTO(project);
    }

    public ProjectDTO updateProject(String email, Long projectId, UpdateProjectRequest request) {
        User user = getUserByEmail(email);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        project = projectRepository.save(project);
        return toProjectDTO(project);
    }

    public void deleteProject(String email, Long projectId) {
        User user = getUserByEmail(email);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        projectRepository.delete(project);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ProjectDTO toProjectDTO(Project project) {
        return new ProjectDTO(
            project.getId(),
            project.getName(),
            project.getDescription(),
            project.getStatus(),
            project.getUser().getId(),
            project.getUser().getUsername(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }
}
