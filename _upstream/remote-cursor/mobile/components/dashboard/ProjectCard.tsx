import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../common/Card';
import { Project } from '../../data/mockData';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusColors = {
    running: '#6c5ce7',
    idle: '#8e8e93',
    error: '#e74c3c',
  };

  const statusColor = statusColors[project.status];

  return (
    <Card>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-white text-lg font-bold flex-1">
          {project.name}
        </Text>
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
      </View>

      <Text className="text-gray-400 text-sm mb-1">
        {project.currentTask}
      </Text>

      <Text className="text-gray-500 text-xs mb-3">
        Agent: {project.agent}
      </Text>

      {/* Progress Bar */}
      <View className="flex-row items-center">
        <View className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${project.progress}%`,
              backgroundColor: statusColor,
            }}
          />
        </View>
        <Text className="text-gray-400 text-xs w-10 text-right">
          {project.progress}%
        </Text>
      </View>
    </Card>
  );
};
