import { View, Text } from 'react-native';
import { POKEMON_TYPE_COLORS } from '../../constants/pokemonTypes';

interface StatBarProps {
  name: string;
  value: number;
  type?: string;
  maxValue?: number;
  hideName?: boolean;
}

export default function StatBar({ name, value, type = 'normal', maxValue = 255, hideName = false }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const barColor = POKEMON_TYPE_COLORS[type.toLowerCase()] || '#CC0000';

  const formatStatName = (statName: string) => {
    const map: Record<string, string> = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SATK',
      'special-defense': 'SDEF',
      'speed': 'SPD',
    };
    return map[statName] || statName.toUpperCase();
  };

  return (
    <View className="flex-row items-center my-1.5">
      {!hideName && (
        <>
          <Text className="w-12 text-xs font-bold text-muted dark:text-gray-400">
            {formatStatName(name)}
          </Text>
          <Text className="w-8 text-xs font-semibold text-onSurface dark:text-white text-right mr-3">
            {value}
          </Text>
        </>
      )}
      <View className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}
