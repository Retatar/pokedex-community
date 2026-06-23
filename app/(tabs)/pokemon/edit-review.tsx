import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReviewStore } from '../../../store/review.store';
import RatingSelector from '../../../components/review/RatingSelector';

export default function EditReviewScreen() {
  const { reviewId, pokemonId } = useLocalSearchParams();
  const router = useRouter();
  const { reviews, updateReview, isLoading, error } = useReviewStore();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const review = reviews[Number(pokemonId)]?.find(r => r.id === Number(reviewId));
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [pokemonId, reviewId]);

  const handleSave = async () => {
    if (rating === 0 || comment.length < 10) return;
    await updateReview(Number(pokemonId), Number(reviewId), rating, comment);
    router.back();
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-onSurface dark:text-white">Edit Review</Text>
        </View>
      </View>

      <ScrollView className="p-4">
        {error ? <Text className="text-error mb-4">{error}</Text> : null}

        <View className="mb-6 items-center">
          <RatingSelector rating={rating} onRatingChange={setRating} size={40} />
          {rating === 0 && <Text className="text-error text-xs">Pilih rating terlebih dahulu</Text>}
        </View>

        <View className="mb-8">
          <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Komentar (Minimal 10 karakter)</Text>
          <TextInput
            className="px-4 py-3 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white min-h-[120px]"
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <View className="flex-row justify-between mt-1">
            <Text className={`text-xs ${comment.length > 0 && comment.length < 10 ? 'text-error' : 'text-muted'}`}>
              {comment.length < 10 && comment.length > 0 ? 'Minimal 10 karakter' : ''}
            </Text>
            <Text className="text-xs text-muted text-right">{comment.length}/1000</Text>
          </View>
        </View>

        <TouchableOpacity
          className={`h-12 rounded-lg items-center justify-center ${rating === 0 || comment.length < 10 || isLoading ? 'bg-primaryDark opacity-50' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={rating === 0 || comment.length < 10 || isLoading}
        >
          <Text className="text-white font-bold text-lg">{isLoading ? 'Menyimpan...' : 'Update Review'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
