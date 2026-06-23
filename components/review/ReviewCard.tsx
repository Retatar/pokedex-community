import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Review } from '../../services/api/reviews.service';
import { useAuthStore } from '../../store/auth.store';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === review.user_id;

  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1">
          {review.avatar_url ? (
            <Image 
              source={{ uri: review.avatar_url }} 
              className="w-10 h-10 rounded-full mr-3 bg-gray-200"
            />
          ) : (
            <View className="w-10 h-10 rounded-full mr-3 bg-primary items-center justify-center">
              <Text className="text-white font-bold text-lg capitalize">{review.user_name?.charAt(0) || 'U'}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-bold text-onSurface dark:text-white">{review.user_name}</Text>
            <View className="flex-row items-center mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={star <= review.rating ? "star" : "star-outline"} 
                  size={14} 
                  color="#FFCB05" 
                />
              ))}
            </View>
          </View>
        </View>

        {isOwner && (
          <View className="flex-row">
            {onEdit && (
              <TouchableOpacity onPress={onEdit} className="p-1 mr-2">
                <Ionicons name="pencil" size={18} color="#003A8C" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} className="p-1">
                <Ionicons name="trash" size={18} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <Text className="text-onSurface dark:text-gray-300 leading-5">{review.comment}</Text>
      <Text className="text-xs text-muted mt-2 text-right">
        {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
      </Text>
    </View>
  );
}
