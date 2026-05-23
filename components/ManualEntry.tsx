import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface ManualEntryProps {
  onSubmit: (memberId: number) => void;
  loading?: boolean;
}

export default function ManualEntry({ onSubmit, loading }: ManualEntryProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    const id = parseInt(value.trim(), 10);
    if (!isNaN(id) && id > 0) {
      onSubmit(id);
      setValue('');
      inputRef.current?.blur();
    }
  };

  const canSubmit = value.trim().length > 0 && !loading;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>MEMBER ID NUMBER</Text>
      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          style={[styles.input, focused && styles.inputFocused]}
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          placeholder="Enter ID…"
          placeholderTextColor={Colors.textMuted}
          editable={!loading}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Check In/Out →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    paddingTop: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.wine,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.beige,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 18,
    fontWeight: '500',
    color: Colors.wine,
  },
  inputFocused: {
    backgroundColor: Colors.white,
    borderColor: Colors.burgundy,
  },
  button: {
    backgroundColor: Colors.burgundy,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(117,22,45,1)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.30,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Colors.beige,
  },
});
