import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TeamPokemon } from '../../services/api/teams.service';
import { pokeApiService } from '../../services/pokeapi/pokeapi.service';
import { TYPE_EFFECTIVENESS } from '../../constants/typeMatchups';
import TypeBadge from '../pokemon/TypeBadge';

interface TeamSynergyProps {
  visible: boolean;
  onClose: () => void;
  pokemons: TeamPokemon[];
}

interface TypeAnalysis {
  type: string;
  count: number;
}

interface AnalysisResult {
  weaknesses: TypeAnalysis[];
  resistances: TypeAnalysis[];
  strengths: TypeAnalysis[];
  recommendations: string[];
}

export default function TeamSynergyModal({ visible, onClose, pokemons }: TeamSynergyProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pokemonTypes, setPokemonTypes] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (visible) {
      analyzeTeam();
    }
  }, [visible]);

  const analyzeTeam = async () => {
    setIsAnalyzing(true);
    const typesMap: Record<number, string[]> = {};

    try {
      for (const p of pokemons) {
        try {
          const detail = await pokeApiService.getPokemonDetail(p.pokemon_id);
          typesMap[p.pokemon_id] = detail.types.map(t => t.toLowerCase());
        } catch {
          typesMap[p.pokemon_id] = [];
        }
      }
      setPokemonTypes(typesMap);

      const weakCount: Record<string, number> = {};
      const resistCount: Record<string, number> = {};
      const strongCount: Record<string, number> = {};
      const totalPokemon = pokemons.length;

      for (const p of pokemons) {
        const types = typesMap[p.pokemon_id] || [];
        for (const t of types) {
          const data = TYPE_EFFECTIVENESS[t];
          if (data) {
            data.weakTo.forEach(w => { weakCount[w] = (weakCount[w] || 0) + 1; });
            data.resistantTo.forEach(r => { resistCount[r] = (resistCount[r] || 0) + 1; });
            data.strongAgainst.forEach(s => { strongCount[s] = (strongCount[s] || 0) + 1; });
          }
        }
      }

      const weaknesses = Object.entries(weakCount)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count }));

      const resistances = Object.entries(resistCount)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count }));

      const strengths = Object.entries(strongCount)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count }));

      const recommendations: string[] = [];
      const topWeak = weaknesses.slice(0, 3);
      for (const w of topWeak) {
        const resistTypes = Object.keys(TYPE_EFFECTIVENESS).filter(t =>
          TYPE_EFFECTIVENESS[t].resistantTo.includes(w.type)
        );
        if (resistTypes.length > 0) {
          recommendations.push(
            `${w.count} dari ${totalPokemon} lemah ${w.type.toUpperCase()}. Tambah: ${resistTypes.slice(0, 3).join(', ')}`
          );
        }
      }

      if (recommendations.length === 0) {
        recommendations.push('Tim Anda cukup seimbang! Tidak ada kelemahan mayor.');
      }

      setResult({ weaknesses, resistances, strengths, recommendations });
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-gray-50 dark:bg-gray-900 rounded-t-3xl max-h-[90%] min-h-[50%]">
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-t-3xl">
            <View className="flex-row items-center">
              <Ionicons name="analytics" size={22} color="#CC0000" />
              <Text className="text-xl font-bold text-gray-900 dark:text-white ml-2">Analisis Tim</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isAnalyzing ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#CC0000" />
              <Text className="text-gray-500 dark:text-gray-400 mt-4 text-base">Menganalisis tim...</Text>
            </View>
          ) : result ? (
            <ScrollView className="flex-1 px-5 pt-5 pb-10">
              {/* Member Cards */}
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ANGGOTA TIM</Text>
              <View className="flex-row flex-wrap mb-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                {pokemons.map(p => (
                  <View key={p.id} className="items-center mr-5 mb-3">
                    <Image source={{ uri: p.pokemon_sprite }} className="w-14 h-14" resizeMode="contain" />
                    <Text className="text-xs text-gray-900 dark:text-white capitalize font-semibold mt-1">{p.pokemon_name}</Text>
                    <View className="flex-row flex-wrap justify-center mt-1">
                      {pokemonTypes[p.pokemon_id]?.map(t => (
                        <View key={t} className="mr-0.5 -mt-1"><TypeBadge type={t} size="small" /></View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Weaknesses */}
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                <Ionicons name="warning" size={18} color="#DC2626" /> Kelemahan Tim
              </Text>
              {result.weaknesses.length > 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5 shadow-sm border border-gray-200 dark:border-gray-700">
                  {result.weaknesses.map((w, i) => (
                    <View key={w.type} className={`${i < result.weaknesses.length - 1 ? 'mb-4 pb-4 border-b border-gray-100 dark:border-gray-700' : ''}`}>
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <TypeBadge type={w.type} size="small" />
                          <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">{w.count}/{pokemons.length} Pokémon</Text>
                        </View>
                        <Text className="text-sm font-bold text-gray-900 dark:text-white">{Math.round((w.count / pokemons.length) * 100)}%</Text>
                      </View>
                      <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${(w.count / pokemons.length) * 100}%`, backgroundColor: '#DC2626' }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-5 border border-green-200 dark:border-green-900">
                  <Text className="text-green-700 dark:text-green-300 font-medium">Tidak ada kelemahan dominan.</Text>
                </View>
              )}

              {/* Resistances */}
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                <Ionicons name="shield-checkmark" size={18} color="#059669" /> Resistensi Tim
              </Text>
              {result.resistances.length > 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5 shadow-sm border border-gray-200 dark:border-gray-700">
                  <View className="flex-row flex-wrap">
                    {result.resistances.map(r => (
                      <View key={r.type} className="mr-2 mb-2 flex-row items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                        <TypeBadge type={r.type} size="small" />
                        <Text className="text-green-600 dark:text-green-400 ml-1 font-bold text-xs">+{r.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-200 dark:border-gray-700">
                  <Text className="text-gray-500 dark:text-gray-400">Tidak ada resistensi dominan.</Text>
                </View>
              )}

              {/* Recommendations */}
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                <Ionicons name="bulb" size={18} color="#FFCB05" /> Rekomendasi
              </Text>
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border border-blue-200 dark:border-blue-900">
                {result.recommendations.map((rec, i) => (
                  <View key={i} className={`flex-row ${i < result.recommendations.length - 1 ? 'mb-4 pb-4 border-b border-blue-100 dark:border-blue-800' : ''}`}>
                    <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white font-bold text-sm">{i + 1}</Text>
                    </View>
                    <Text className="text-sm text-gray-800 dark:text-gray-200 flex-1 leading-6">{rec}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                className="bg-primary h-14 rounded-2xl items-center justify-center mb-10 shadow-md"
                onPress={analyzeTeam}
              >
                <Text className="text-white font-bold text-lg">Analisis Ulang</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
