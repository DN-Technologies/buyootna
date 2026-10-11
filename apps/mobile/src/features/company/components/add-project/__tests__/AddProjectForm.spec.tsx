import { fireEvent, render } from '@testing-library/react-native';

import AddProjectForm from '../AddProjectForm';

const setup = (images: string[] = []) => {
  const onPickImages = jest.fn();
  const onRemoveImage = jest.fn();
  const utils = render(
    <AddProjectForm
      projectTitle=""
      onProjectTitleChange={jest.fn()}
      description=""
      onDescriptionChange={jest.fn()}
      images={images}
      onPickImages={onPickImages}
      onRemoveImage={onRemoveImage}
    />,
  );
  return { utils, onPickImages };
};

describe('AddProjectForm', () => {
  it('shows the three required fields and their hints', async () => {
    const { getByText } = await setup().utils;

    expect(getByText(/^عنوان المشروع/)).toBeTruthy();
    expect(getByText(/^الوصف/)).toBeTruthy();
    expect(getByText(/^الصور/)).toBeTruthy();
    expect(getByText('يجب أن لا يتخطى الوصف 100 حرف.')).toBeTruthy();
    expect(getByText('يمكن إضافة حتى 3 صور.')).toBeTruthy();
    expect(
      getByText('الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)'),
    ).toBeTruthy();
  });

  it('opens the picker from the dropzone', async () => {
    const { utils, onPickImages } = setup();
    const { getByTestId } = await utils;

    await fireEvent.press(getByTestId('project-images-dropzone'));
    expect(onPickImages).toHaveBeenCalled();
  });

  it('hides the dropzone once three photos are chosen', async () => {
    const { queryByTestId } = await setup(['a.jpg', 'b.jpg', 'c.jpg']).utils;

    expect(queryByTestId('project-images-dropzone')).toBeNull();
  });
});
