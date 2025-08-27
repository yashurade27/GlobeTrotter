"use client";

import { IconTrendingDown, IconTrendingUp, IconUsers, IconUserCheck, IconUserX, IconShield } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// Dummy user data based on the Prisma User schema
const monthlyUserData = [
  { month: 'Jan', totalUsers: 840, newUsers: 45, activeUsers: 620 },
  { month: 'Feb', totalUsers: 920, newUsers: 80, activeUsers: 680 },
  { month: 'Mar', totalUsers: 980, newUsers: 60, activeUsers: 720 },
  { month: 'Apr', totalUsers: 1050, newUsers: 70, activeUsers: 780 },
  { month: 'May', totalUsers: 1120, newUsers: 70, activeUsers: 820 },
  { month: 'Jun', totalUsers: 1180, newUsers: 60, activeUsers: 850 },
  { month: 'Jul', totalUsers: 1247, newUsers: 67, activeUsers: 892 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${(entry.value ?? 0).toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const UserDataAreaChart = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                User Growth Analytics
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Monthly user registration and activity trends
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Last 7 months</Badge>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <IconUsers className="h-4 w-4" />
                <span>1,247 total</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              User Growth Analytics
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Monthly user registration and activity trends
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">Last 7 months</Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <IconUsers className="h-4 w-4" />
              <span>1,247 total</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyUserData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-700" 
              />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="totalUsers"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#totalUsers)"
                strokeWidth={2}
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stackId="2"
                stroke="#10b981"
                fill="url(#activeUsers)"
                strokeWidth={2}
                name="Active Users"
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stackId="3"
                stroke="#f59e0b"
                fill="url(#newUsers)"
                strokeWidth={2}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Active Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">New Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDataAreaChart;