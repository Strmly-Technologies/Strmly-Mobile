import { View, Text, Image } from "react-native";
import React from "react";

type CreatorData = {
    profile: string;
    name: string;
    username: string;
};

const CreatorInfo = ({ profile, name, username }: CreatorData) => {
    return (
        <View>
            <View className="flex-row items-center gap-3 mb-4">
                <Image
                    source={require("../../../../assets/images/back.png")}
                    className="size-5 rounded-full"
                />

                <View className="flex-row items-center justify-center gap-2">
                    <View className="p-5 rounded-full bg-gray-500"></View>
                    <View className="items-center">
                        <Text className="text-white text-lg">{name}</Text>
                        <Text className="text-gray-400 text-xs">{username}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CreatorInfo;
