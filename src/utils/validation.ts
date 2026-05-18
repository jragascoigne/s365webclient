const allowedImageTypes = ['image/png', 'image/jpeg', 'image/gif'];

export function validateImage(file) {
  if (!file) return '';
  if (!allowedImageTypes.includes(file.type)) {
    return 'Images must be PNG, JPEG, or GIF.';
  }
  return '';
}
