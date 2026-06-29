import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from '@/core/components/chat/ChatHeader';
import ChatInputBar from '@/core/components/chat/ChatInputBar';
import ChatPinnedContext from '@/core/components/chat/ChatPinnedContext';
import DateSeparator from '@/core/components/chat/DateSeparator';
import ImageDownloadBottomSheet from '@/core/components/chat/ImageDownloadBottomSheet';
import ImageMessageBubble from '@/core/components/chat/ImageMessageBubble';
import MessageBubble from '@/core/components/chat/MessageBubble';
import PropertyMessageBubble from '@/core/components/chat/PropertyMessageBubble';

// --- UPGRADED MOCK HISTORY ---
// Using a generic type discriminator (`type`) to know what to render
const MOCK_MESSAGES = [
  {
    id: '1',
    type: 'TEXT',
    text: 'حسنا في انتظارك.',
    isMine: true,
    timestamp: '14:22',
    isRead: true,
  },
  {
    id: '2',
    type: 'IMAGE',
    imageUrl: 'https://via.placeholder.com/400x300',
    isMine: true,
    timestamp: '14:22',
    isRead: true,
  },
  {
    id: '3',
    type: 'TEXT',
    text: 'سأقوم بالاتصال بك من خلال الرقم الموضح',
    isMine: false,
    timestamp: '14:22',
  },
  {
    id: '4',
    type: 'TEXT',
    text: 'مرحبا استاذ محمد، نعم قابل للتفاوض.',
    isMine: true,
    timestamp: '14:22',
    isRead: true,
  },
  {
    id: '5',
    type: 'TEXT',
    text: 'هل عقار السالمية متاح للتفاوض في سعر الايجار؟',
    isMine: false,
    timestamp: '14:22',
  },
  { id: '6', type: 'DATE', text: 'أمس' },
  {
    id: '7',
    type: 'PROPERTY',
    property: {
      id: 'prop-123',
      imageUrl:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      price: 150000,
      title: 'شقة بالسالمية',
      type: 'شقة',
      area: 200,
      bedrooms: 3,
      bathrooms: 2,
      location: 'السالمية، شارع 2، بناية 10، شقة 4',
    },
    isMine: false,
    timestamp: '14:22',
  },
];

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Main Message Renderer
  const renderMessage = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'DATE':
        return <DateSeparator dateText={item.text} />;
      case 'PROPERTY':
        return (
          <PropertyMessageBubble
            property={item.property}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={item.isRead}
            onPressProperty={() =>
              console.log('Navigate to property:', item.property.id)
            }
          />
        );
      case 'IMAGE':
        return (
          <ImageMessageBubble
            imageUrl={item.imageUrl}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={item.isRead}
            onPressImage={() => setShowImageOptions(true)}
          />
        );
      case 'TEXT':
      default:
        return (
          <MessageBubble
            text={item.text}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={item.isRead}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Invisible Overlay to Close Dropdowns */}
      {(showAttachmentMenu || showMoreMenu) && (
        <Pressable
          className="absolute inset-0 z-40 bg-transparent"
          onPress={() => {
            setShowAttachmentMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ChatHeader
          userName="محمد العتيبي"
          isOnline={true}
          avatarUrl="https://i.pravatar.cc/150?img=11"
          onReportUser={() => console.log('Report user')}
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
        />

        <ChatPinnedContext
          title="شقة بالسالمية"
          badgeText="للبيع"
          price="450,000 د.ك"
          area="200 م2"
          onDismiss={() => console.log('Dismiss pinned context')}
        />

        <FlatList
          inverted
          data={MOCK_MESSAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
        />

        <ChatInputBar
          inputText={inputText}
          onInputChange={setInputText}
          onSend={() => console.log('Send message')}
          showAttachmentMenu={showAttachmentMenu}
          setShowAttachmentMenu={setShowAttachmentMenu}
          onAttachImage={() => {
            console.log('Attach image');
            setShowImageOptions(true);
          }}
          onAttachFile={() => console.log('Attach file')}
        />
      </KeyboardAvoidingView>

      <ImageDownloadBottomSheet
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onDownload={() => console.log('Download image')}
      />
    </SafeAreaView>
  );
}

