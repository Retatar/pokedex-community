import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

export default function RatingSelector({ rating, onRatingChange, size = 32 }: RatingSelectorProps) {
  return (
    <View className="flex-row items-center justify-center my-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => onRatingChange(star)}
          className="p-1"
        >
          <Ionicons 
            name={star <= rating ? "star" : "star-outline"} 
            size={size} 
            color={star <= rating ? "#FFCB05" : "#D1D5DB"} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
