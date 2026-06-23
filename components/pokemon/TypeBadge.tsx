import { View, Text } from 'react-native';
import { POKEMON_TYPE_COLORS } from '../../constants/pokemonTypes';

interface TypeBadgeProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

export default function TypeBadge({ type, size = 'medium' }: TypeBadgeProps) {
  const bgColor = POKEMON_TYPE_COLORS[type.toLowerCase()] || '#A8A77A'; // Default to Normal color
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-1.5 text-base',
  };

  return (
    <View 
      className={`rounded-full items-center justify-center mr-1 mb-1 shadow-sm ${sizeClasses[size]}`}
      style={{ backgroundColor: bgColor }}
    >
      <Text className="text-white font-bold capitalize shadow-sm">
        {type}
      </Text>
    </View>
  );
}
