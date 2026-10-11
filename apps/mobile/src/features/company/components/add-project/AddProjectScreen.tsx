import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
import CompanySuccessSheet from '../CompanySuccessSheet';
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
        <CompanyFormHeader
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
        <View className="px-4 pb-8 pt-3">
          <CompanySubmitButton
            label="نشر المشروع"
            disabled={!project.isValid || project.isSubmitting}
            onPress={project.submit}
          />
        </View>
      </KeyboardAvoidingView>

      {/* --- Success bottom sheet --- */}
      <CompanySuccessSheet
        ref={project.successSheetRef}
        title="تم نشر المشروع بنجاح!"
        description="أصبح الآن المشروع ظاهرًا في معرض الأعمال."
        primaryLabel="عرض المشروع"
        onPrimary={project.viewProject}
        secondaryLabel="إضافة مشروع آخر"
        onSecondary={project.addAnother}
      />
    </SafeAreaView>
  );
}
