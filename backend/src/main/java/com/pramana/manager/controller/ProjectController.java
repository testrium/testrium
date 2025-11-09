package com.pramana.manager.controller;

import com.pramana.manager.dto.CreateProjectRequest;
import com.pramana.manager.dto.ProjectDTO;
import com.pramana.manager.dto.UpdateProjectRequest;
import com.pramana.manager.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects(
            Authentication authentication,
            @RequestParam(required = false) String status) {
        String email = authentication.getName();

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(projectService.getProjectsByStatus(email, status));
        }

        return ResponseEntity.ok(projectService.getAllProjects(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(
            Authentication authentication,
            @PathVariable Long id) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.getProjectById(email, id));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(
            Authentication authentication,
            @RequestBody CreateProjectRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.createProject(email, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody UpdateProjectRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.updateProject(email, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(
            Authentication authentication,
            @PathVariable Long id) {
        String email = authentication.getName();
        projectService.deleteProject(email, id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }
}
