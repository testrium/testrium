// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Button } from "../components/ui/Button.jsx";
import { LayoutDashboard, LucideAlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound () {
    const navigate = useNavigate();

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
                dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
                <main className="w-full max-w-lg text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50">
                        <LucideAlertTriangle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h1 className="text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Page not found
                    </h2>

                    <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                        Oops! We couldn't find the page you're looking for. <br />
                        It may have been moved or no longer exists.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                </main>
            </div>
        </>
    );
}