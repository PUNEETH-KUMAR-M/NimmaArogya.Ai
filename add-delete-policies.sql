-- Add delete policies for the profiles table
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Add a policy for admins to delete any profile
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add delete policies for the doctors table
CREATE POLICY "Admins can delete doctors"
  ON doctors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add a policy for doctors to delete their own record
CREATE POLICY "Doctors can delete their own record"
  ON doctors FOR DELETE
  USING (user_id = auth.uid());
