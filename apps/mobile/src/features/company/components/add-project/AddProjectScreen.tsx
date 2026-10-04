import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';

import CompanySubmitButton from '../CompanySubmitButton';
import CompanyEditProfileHeader from '../edit-profile/CompanyEditProfileHeader';
import AddProjectForm from './AddProjectForm';
import { useAddProject } from './useAddProject';

export default function AddProjectScreen() {
  const project = useAddProject();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- Header --- */}
        <CompanyEditProfileHeader
          onBack={project.goBack}
          title="اضافة مشروع لمعرض الأعمال"
        />

        {/* --- Form --- */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <AddProjectForm
            projectTitle={project.projectTitle}
            onProjectTitleChange={project.setProjectTitle}
            description={project.description}
            onDescriptionChange={project.setDescription}
            images={project.images}
            onPickImages={project.pickImages}
            onRemoveImage={project.removeImage}
          />
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-6 pt-3">
          <CompanySubmitButton
            label="نشر المشروع"
            disabled={!project.isValid || project.isSubmitting}
            onPress={project.submit}
          />
        </View>
      </KeyboardAvoidingView>

      {/* --- Success bottom sheet --- */}
      <SuccessBottomSheet
        ref={project.successSheetRef}
        title="تم نشر المشروع بنجاح!"
        description="أصبح الآن المشروع ظاهرًا في معرض الأعمال."
        buttonText="عرض المشروع"
        onPress={project.viewProject}
        secondaryButtonText="إضافة مشروع آخر"
        onSecondaryPress={project.addAnother}
        secondaryButtonVariant="neutral"
      />
    </SafeAreaView>
  );
}
