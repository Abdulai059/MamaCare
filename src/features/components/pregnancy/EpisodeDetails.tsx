import { Text, View } from "react-native";
import type { CareEpisode } from "@/utils/types/careEpisode";

interface EpisodeDetailsProps {
  episode: CareEpisode;
}

function DetailRow({
  label,
  value,
  valueClassName = "text-gray-700",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center">
      <Text className="text-xs font-semibold uppercase text-gray-400 w-28">
        {label}
      </Text>
      <Text className={`text-sm font-medium flex-1 ${valueClassName}`}>
        {value}
      </Text>
    </View>
  );
}

export function EpisodeDetails({ episode }: EpisodeDetailsProps) {
  return (
    <View className="mb-4 gap-y-1.5">
      <DetailRow label="Episode Type:" value={episode.episode_type} />
      <DetailRow
        label="Status:"
        value={episode.status}
        valueClassName="font-semibold text-green-600"
      />
      <DetailRow label="Start Date:" value={episode.start_date} />
      {episode.expected_end_date ? (
        <DetailRow label="Expected Due:" value={episode.expected_end_date} />
      ) : null}
    </View>
  );
}
