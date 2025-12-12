package com.pramana.manager.service;

import com.pramana.manager.entity.Application;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.ApplicationRepository;
import com.pramana.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getActiveApplications() {
        return applicationRepository.findByStatus("ACTIVE");
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public Application createApplication(Application application, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        application.setCreatedBy(user);
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
