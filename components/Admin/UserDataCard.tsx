import { IconTrendingDown, IconTrendingUp, IconUsers, IconUserCheck, IconUserX, IconShield } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dummy user data based on the Prisma User schema
const userData = {
  totalUsers: 1247,
  newUsersThisMonth: 87,
  activeUsers: 892,
  bannedUsers: 12,
  adminUsers: 5,
  userGrowthRate: 8.2,
  userRetentionRate: 73.5,
  lastUpdated: "2 hours ago"
};

const UserDataCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {/* Total Users Card */}
      <Card className="hover:shadow-lg hover:dark:shadow-xl hover:dark:shadow-gray-900/20 transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Total Users
            </CardTitle>
          </div>
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <IconUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userData.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-950/50 px-1.5 py-0.5 rounded-md">
              <IconTrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium text-sm">+{userData.userGrowthRate}%</span>
            </div>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* New Users This Month */}
      <Card className="hover:shadow-lg hover:dark:shadow-xl hover:dark:shadow-gray-900/20 transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              New Users
            </CardTitle>
          </div>
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
            <IconUserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userData.newUsersThisMonth}
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium">
              This Month
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round((userData.newUsersThisMonth / userData.totalUsers) * 100)}% of total
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="hover:shadow-lg hover:dark:shadow-xl hover:dark:shadow-gray-900/20 transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Active Users
            </CardTitle>
          </div>
          <div className="p-1.5 bg-green-50 dark:bg-green-950/50 rounded-lg">
            <IconUsers className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userData.activeUsers.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-950/50 px-1.5 py-0.5 rounded-md">
              <span className="text-green-700 dark:text-green-300 font-medium text-sm">{userData.userRetentionRate}%</span>
            </div>
            <span className="text-sm text-muted-foreground">retention rate</span>
          </div>
        </CardContent>
      </Card>

      {/* User Management Stats */}
      <Card className="hover:shadow-lg hover:dark:shadow-xl hover:dark:shadow-gray-900/20 transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Management
            </CardTitle>
          </div>
          <div className="p-1.5 bg-slate-50 dark:bg-slate-950/50 rounded-lg">
            <IconShield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Administrators</span>
            <Badge variant="outline" className="text-sm font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              {userData.adminUsers}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Banned Users</span>
            <Badge variant="destructive" className="text-sm font-medium">
              {userData.bannedUsers}
            </Badge>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-muted-foreground">
              Last updated {userData.lastUpdated}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataCard;