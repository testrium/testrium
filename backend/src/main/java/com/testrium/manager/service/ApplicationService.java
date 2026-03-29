package com.testrium.manager.service;

import com.testrium.manager.entity.Application;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.ApplicationRepository;
import com.testrium.manager.repository.ProjectRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getActiveApplications() {
        return applicationRepository.findByStatus("ACTIVE");
    }

    public List<Application> getApplicationsByProject(Long projectId) {
        return applicationRepository.findByProjectId(projectId);
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public Application createApplication(Application application, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(application.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        application.setCreatedBy(user);
        application.setProject(project);
        return applicationRepository.save(application);
    }

    public Application updateApplication(Long id, Application updatedApplication) {
        Application application = getApplicationById(id);
        application.setName(updatedApplication.getName());
        application.setDescription(updatedApplication.getDescription());
        application.setStatus(updatedApplication.getStatus());
        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
}
