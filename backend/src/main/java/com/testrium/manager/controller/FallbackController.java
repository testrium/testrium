package com.testrium.manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-file routes to index.html so React Router handles navigation.
 */
@Controller
public class FallbackController {

    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forwardRoot() {
        return "forward:/index.html";
    }

    @RequestMapping(value = "/{path1:[^\\.]*}/{path2:[^\\.]*}")
    public String forwardNested() {
        return "forward:/index.html";
    }

    @RequestMapping(value = "/{path1:[^\\.]*}/{path2:[^\\.]*}/{path3:[^\\.]*}")
    public String forwardDeep() {
        return "forward:/index.html";
    }
}
