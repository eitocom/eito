'use client';

import React from 'react';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  githubRepoUrl: string;
  owner: {
    name: string;
    avatarUrl: string;
  };
  stats: {
    openBountiesCount: number;
    totalBountyAmountBrl: number;
  };
}

export default function ProjectCard({
  title,
  description,
  githubRepoUrl,
  owner,
  stats,
}: ProjectCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={owner.avatarUrl || '/default-avatar.png'}
            alt={owner.name}
            className="w-10 h-10 rounded-full border border-gray-200"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{owner.name}</span>
        </div>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          {stats.openBountiesCount} bounties abertas • R$ {stats.totalBountyAmountBrl.toFixed(2)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center justify-end">
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 underline flex items-center"
        >
          Ver no GitHub &rarr;
        </a>
      </div>
    </div>
  );
}
