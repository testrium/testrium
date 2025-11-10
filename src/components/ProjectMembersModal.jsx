import React from 'react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter
} from './ui/Modal';
import { Users, Trash2, AlertCircle } from 'lucide-react';

export default function ProjectMembersModal({
  isOpen,
  onClose,
  project,
  members,
  availableUsers,
  selectedUserIds,
  setSelectedUserIds,
  memberRole,
  setMemberRole,
  onAddMembers,
  onRemoveMember,
  loading,
  error
}) {
  const handleUserToggle = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <ModalHeader onClose={onClose}>
        <div>
          <ModalTitle>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Project Members
            </div>
          </ModalTitle>
          <ModalDescription>
            Add or remove members for project: {project?.name}
          </ModalDescription>
        </div>
      </ModalHeader>

      <ModalContent>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Add Members Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add Members</h3>

            {availableUsers.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No users available to add
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                  {availableUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Role
                    </label>
                    <Select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="LEAD">Lead</option>
                      <option value="VIEWER">Viewer</option>
                    </Select>
                  </div>
                  <div className="pt-6">
                    <Button
                      onClick={onAddMembers}
                      disabled={loading || selectedUserIds.length === 0}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Add Selected ({selectedUserIds.length})
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Members Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Current Members ({members.length})
            </h3>

            {members.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No members in this project yet
              </p>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.role === 'LEAD'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          : member.role === 'VIEWER'
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      }`}>
                        {member.role}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member.id)}
                        disabled={loading}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
