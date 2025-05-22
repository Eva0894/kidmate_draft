import { supabase } from './Supabase';

/**
 * 发送重置密码邮件
 * @param email 
 */
export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'kidmate://reset-password-confirm'
  });

  if (error) {
    console.error('❌ Failed to send reset email:', error.message);
    throw error;
  }

  console.log('✅ Reset email sent successfully');
  return true;
};

/**
 * 更新用户密码（用户需已通过邮件验证并登录）
 * @param newPassword 
 */
export const updateUserPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('❌ Failed to update password:', error.message);
    throw error;
  }

  console.log('✅ Password updated successfully', data);
  return data;
};