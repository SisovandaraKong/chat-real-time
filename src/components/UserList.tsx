import { User } from '@/types/chat';

interface UserListProps {
  users: User[];
  currentUser: User | null;
  onUserSelect: (user: User) => void;
  selectedUser: User | null;
}

export default function UserList({ users, currentUser, onUserSelect, selectedUser }: UserListProps) {
  const otherUsers = users.filter(user => user.id !== currentUser?.id);

  return (
    <div className="w-1/4 bg-gray-100 border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      <div className="overflow-y-auto h-full">
        {otherUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => onUserSelect(user)}
            className={`p-3 border-b cursor-pointer hover:bg-gray-200 ${
              selectedUser?.id === user.id ? 'bg-blue-100' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <div className="font-medium">{user.displayName}</div>
                <div className="text-sm text-gray-600">@{user.username}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}