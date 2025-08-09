import React from "react";
import { View, Text, Pressable, Modal } from "react-native";

type ModalMessageProps = {
  visible: boolean;
  text: string;
  needCloseButton: boolean;
  onClose: (value: boolean) => void;
};

const StyledView = View;
const StyledText = Text;
const StyledPressable = Pressable;

const ModalMessage: React.FC<ModalMessageProps> = ({
  visible,
  text,
  needCloseButton,
  onClose,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => onClose(false)}
    >
      <StyledView className="flex-1 justify-center items-center bg-[#000000A8]">
        <StyledView className="bg-black border border-gray-800 rounded-xl p-6 w-4/5 shadow-lg">
          <StyledText className="text-lg text-white mb-4 text-center">
            {text}
          </StyledText>
          (
            <StyledPressable
              onPress={() => onClose(false)}
              className="bg-blue-600 px-4 py-2 rounded-full self-center"
            >
              <StyledText className="text-white font-semibold">
                Close
              </StyledText>
            </StyledPressable>
          )
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default ModalMessage;
