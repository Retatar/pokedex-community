import { View } from 'react-native';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <View className={`bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`} />
  );
}

export function PokemonCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <View className="flex-row rounded-xl mb-3 overflow-hidden border border-border bg-white dark:bg-gray-800 p-2 items-center">
        <Skeleton className="w-20 h-20 rounded-lg mr-4" />
        <View className="flex-1 space-y-2">
          <Skeleton className="w-16 h-3 rounded" />
          <Skeleton className="w-32 h-5 rounded" />
          <View className="flex-row mt-1">
            <Skeleton className="w-12 h-6 rounded-full mr-2" />
            <Skeleton className="w-12 h-6 rounded-full" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 rounded-xl m-1.5 p-4 items-center bg-white dark:bg-gray-800 border border-border">
      <View className="w-full items-end mb-2">
        <Skeleton className="w-12 h-3 rounded" />
      </View>
      <Skeleton className="w-24 h-24 rounded-full mb-3" />
      <Skeleton className="w-28 h-5 rounded mb-3" />
      <View className="flex-row justify-center">
        <Skeleton className="w-12 h-5 rounded-full mr-1.5" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </View>
    </View>
  );
}

export function TeamCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl mb-4 p-4 border border-border">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Skeleton className="w-32 h-5 rounded mb-2" />
          <Skeleton className="w-48 h-3 rounded" />
        </View>
        <Skeleton className="w-6 h-6 rounded" />
      </View>

      <View className="flex-row justify-between mt-2">
        {Array(6).fill(null).map((_, index) => (
          <Skeleton key={index} className="w-10 h-10 rounded-full" />
        ))}
      </View>
    </View>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <View className="flex-1 bg-background dark:bg-surface">
      {/* Header Skeleton */}
      <View className="pt-12 pb-8 px-4 rounded-b-[40px] items-center bg-gray-200 dark:bg-gray-800 relative z-10 shadow-md">
        <View className="flex-row justify-between w-full mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <View className="flex-row">
            <Skeleton className="w-10 h-10 rounded-full mr-2" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </View>
        </View>
        <Skeleton className="w-48 h-48 rounded-full mb-4 animate-pulse" />
        <Skeleton className="w-36 h-8 rounded mb-2" />
        <Skeleton className="w-16 h-4 rounded mb-4" />
        <View className="flex-row">
          <Skeleton className="w-16 h-6 rounded-full mr-2" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </View>
      </View>

      {/* Tabs Menu Skeleton */}
      <View className="flex-row justify-around bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-border shadow-sm">
        {Array(4).fill(null).map((_, i) => (
          <Skeleton key={i} className="w-16 h-6 rounded" />
        ))}
      </View>

      {/* Tab Content Skeleton */}
      <View className="flex-1 p-6 space-y-4">
        <Skeleton className="w-24 h-6 rounded mb-4" />
        {Array(6).fill(null).map((_, i) => (
          <View key={i} className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Skeleton className="w-16 h-4 rounded" />
              <Skeleton className="w-8 h-4 rounded" />
            </View>
            <Skeleton className="w-full h-3 rounded-full" />
          </View>
        ))}
      </View>
    </View>
  );
}
