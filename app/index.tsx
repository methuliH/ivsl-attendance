import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useAuth } from './_layout';
import { login as apiLogin } from '../constants/api';
import { Colors } from '../constants/colors';
import Monogram from '../components/Monogram';

export default function LoginScreen() {
  const { token, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const emailUnderline = useRef(new Animated.Value(0)).current;
  const passwordUnderline = useRef(new Animated.Value(0)).current;

  // Auto-redirect if already logged in
  useEffect(() => {
    if (token) {
      router.replace('/dashboard');
    }
  }, [token]);

  useEffect(() => {
    Animated.timing(emailUnderline, {
      toValue: emailFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [emailFocused, emailUnderline]);

  useEffect(() => {
    Animated.timing(passwordUnderline, {
      toValue: passwordFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [passwordFocused, passwordUnderline]);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await apiLogin(email.trim(), password);
      if (response.response_code === 200 && response.data?.Employee) {
        const emp = response.data.Employee;
        await login(emp.employee_app_token, emp);
        router.replace('/dashboard');
      } else {
        setError(response.response_message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailBorderColor = emailUnderline.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderStrong, Colors.burgundy],
  });

  const passwordBorderColor = passwordUnderline.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderStrong, Colors.burgundy],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Decorative background circles */}
      <View pointerEvents="none" style={[styles.decorCircle, styles.decorTopRight]} />
      <View pointerEvents="none" style={[styles.decorCircle, styles.decorBottomLeft]} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Monogram size={80} fontSize={28} />
          <Text style={styles.orgName}>INSTITUTE OF VALUERS OF SRI LANKA</Text>
          <Text style={styles.appTitle}>Event Attendance</Text>
          <Text style={styles.subtitle}>Authorised personnel only</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <Animated.View style={[styles.inputUnderline, { borderBottomColor: emailBorderColor }]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
                placeholderTextColor={Colors.textMuted}
              />
            </Animated.View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <Animated.View
              style={[styles.inputUnderline, { borderBottomColor: passwordBorderColor }]}
            >
              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                editable={!loading}
                placeholderTextColor={Colors.textMuted}
              />
            </Animated.View>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.beige} />
                <Text style={styles.signInButtonText}>Signing in…</Text>
              </View>
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>IVSL Attendance Management System</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  decorCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(117,22,45,0.07)',
  },
  decorTopRight: {
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -90,
    right: -90,
  },
  decorBottomLeft: {
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -70,
    left: -110,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 100,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 44,
  },
  orgName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: Colors.burgundy,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 16,
  },
  appTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: Colors.wine,
    letterSpacing: -0.3,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  form: {
    gap: 22,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: Colors.burgundy,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  inputUnderline: {
    borderBottomWidth: 1.5,
    paddingBottom: 9,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: Colors.wine,
    backgroundColor: 'transparent',
    padding: 0,
  },
  errorBanner: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.burgundy,
    backgroundColor: 'rgba(117,22,45,0.07)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  signInButton: {
    backgroundColor: Colors.burgundy,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(117,22,45,1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  signInButtonDisabled: {
    opacity: 0.70,
  },
  signInButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Colors.beige,
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 44,
  },
});
