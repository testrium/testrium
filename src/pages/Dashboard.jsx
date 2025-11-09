import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl">Pramana Manager</span>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <strong>{user?.username}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Pramana Manager - Your test case management platform
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Projects</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total projects</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Test Cases</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total test cases</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Test Runs</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active test runs</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Getting Started</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Authentication setup complete</p>
              <p>⏳ Coming next: Project management</p>
              <p>⏳ Coming soon: Test case management</p>
              <p>⏳ Coming soon: Test plans & runs</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}