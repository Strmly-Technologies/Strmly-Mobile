import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy for STRMLY Technologies.Pvt.Ltd</Text>
          <Text style={styles.lastUpdated}>Last updated: July 30, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.sectionText}>
              At Strmly, your privacy is very important to us. This Privacy Policy explains how we collect, 
              use, disclose, and protect your personal information when you use our services through our 
              mobile app and website (the "Service"). By accessing or using the Service, you consent to 
              the practices described in this Policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            
            <Text style={styles.subsectionTitle}>Personal Information</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Name, username, email address, mobile number</Text>
              <Text style={styles.bulletPoint}>• Profile photo and bio (if provided)</Text>
            </View>

            <Text style={styles.subsectionTitle}>Content & Usage Information</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Videos uploaded, comments, likes, shares, reports</Text>
              <Text style={styles.bulletPoint}>• Viewing history, search queries, watch time, interaction logs</Text>
            </View>

            <Text style={styles.subsectionTitle}>Device & Technical Data</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Device type, operating system, app version</Text>
              <Text style={styles.bulletPoint}>• IP address, browser type, language, crash logs</Text>
              <Text style={styles.bulletPoint}>• Unique device identifiers and advertising IDs</Text>
            </View>

            <Text style={styles.subsectionTitle}>Location Data</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Approximate or precise location (if permission is granted)</Text>
            </View>

            <Text style={styles.subsectionTitle}>Payment Information</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• We may collect limited transaction details through third-party payment processors (e.g., Razorpay, Stripe, UPI)</Text>
              <Text style={styles.bulletPoint}>• We do not store your card, UPI, or bank account details on our servers</Text>
            </View>

            <Text style={styles.subsectionTitle}>Third-Party SDK & Analytics</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• We use SDKs (e.g., Firebase, Google Analytics, OneSignal) for performance, analytics, and crash reporting. These tools may collect device identifiers and app usage</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.sectionText}>We use your information to:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Deliver and improve our services and recommendations</Text>
              <Text style={styles.bulletPoint}>• Facilitate uploads, subscriptions, live streaming, and purchases</Text>
              <Text style={styles.bulletPoint}>• Personalize content and in-app advertisements</Text>
              <Text style={styles.bulletPoint}>• Respond to your queries and provide support</Text>
              <Text style={styles.bulletPoint}>• Monitor for fraud, abuse, and security threats</Text>
              <Text style={styles.bulletPoint}>• Comply with legal obligations and enforce our Terms of Service</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Legal Basis for Processing (As per Indian Law)</Text>
            <Text style={styles.sectionText}>We process your personal data based on:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Your explicit consent (e.g., for accessing your camera, location, or payment info)</Text>
              <Text style={styles.bulletPoint}>• Contractual necessity (e.g., account creation, subscriptions)</Text>
              <Text style={styles.bulletPoint}>• Legal obligations (e.g., for tax compliance or regulatory disclosures)</Text>
              <Text style={styles.bulletPoint}>• Legitimate interest (e.g., platform improvement, analytics)</Text>
            </View>
            <Text style={styles.sectionText}>
              You may withdraw your consent at any time by adjusting your settings or contacting us.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Sharing Your Information</Text>
            <Text style={styles.sectionText}>We may share your data with:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Other users (e.g., your public videos, comments, username, profile photo)</Text>
              <Text style={styles.bulletPoint}>• Service providers who help us operate and maintain the platform (e.g., cloud hosting, analytics, payment processing)</Text>
              <Text style={styles.bulletPoint}>• Legal and government authorities if required under applicable laws</Text>
            </View>
            <Text style={styles.sectionText}>We do not sell your personal information.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights & Choices</Text>
            <Text style={styles.sectionText}>You have the right to:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Access, correct, or delete your personal data</Text>
              <Text style={styles.bulletPoint}>• Withdraw consent for data collection</Text>
              <Text style={styles.bulletPoint}>• Restrict or object to certain processing</Text>
              <Text style={styles.bulletPoint}>• Disable location access or other permissions in your device settings</Text>
              <Text style={styles.bulletPoint}>• Opt out of marketing emails or push notifications</Text>
            </View>
            <Text style={styles.sectionText}>
              To make such requests, contact our Grievance Officer listed below.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. App Permissions (Android)</Text>
            <Text style={styles.sectionText}>We may request the following permissions:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Camera & Microphone – for video recording and live streaming</Text>
              <Text style={styles.bulletPoint}>• Storage – for saving or uploading media files</Text>
              <Text style={styles.bulletPoint}>• Location – for localizing recommendations and content (optional)</Text>
            </View>
            <Text style={styles.sectionText}>
              You can change or revoke these permissions in your device settings at any time.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Data Retention</Text>
            <Text style={styles.sectionText}>We retain your personal data only for as long as:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Necessary to provide the services and fulfill your transactions</Text>
              <Text style={styles.bulletPoint}>• Required under applicable laws (e.g., tax or compliance obligations)</Text>
              <Text style={styles.bulletPoint}>• Needed to resolve disputes or enforce agreements</Text>
            </View>
            <Text style={styles.sectionText}>
              If you request deletion of your account, we will remove your personal information, 
              subject to legal retention periods.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Strmly is not intended for users under the age of 13. We do not knowingly collect 
              personal data from children. If we become aware that we have collected such information, 
              we will delete it immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
            <Text style={styles.sectionText}>
              Your data may be stored or processed in data centers outside India. Regardless of where 
              it is processed, we apply the same standards of data protection as described in this policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Data Security</Text>
            <Text style={styles.sectionText}>
              We use reasonable physical, electronic, and managerial safeguards to protect your data:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• HTTPS encryption</Text>
              <Text style={styles.bulletPoint}>• Secure password hashing</Text>
              <Text style={styles.bulletPoint}>• Firewalls and access controls</Text>
            </View>
            <Text style={styles.sectionText}>
              However, no system is 100% secure. Keep your password confidential and avoid sharing 
              sensitive information in public areas of the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Grievance Officer (India Compliance)</Text>
            <Text style={styles.sectionText}>
              In compliance with Rule 5(9) of the IT Rules 2011 and Section 13 of the DPDP Act, 
              please contact:
            </Text>
            <View style={styles.grievanceInfo}>
              <Text style={styles.grievanceLabel}>Name:</Text>
              <Text style={styles.grievanceValue}>Rishab Raj</Text>
              <Text style={styles.grievanceLabel}>Email:</Text>
              <Text style={styles.grievanceValue}>team@strmly.com</Text>
              <Text style={styles.grievanceLabel}>Response Time:</Text>
              <Text style={styles.grievanceValue}>Within 15 working days</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time. If material changes are made, 
              we will notify you via app notification or email. The "Last updated" date at the 
              top reflects the latest version.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions or complaints regarding this Privacy Policy or your data, 
              please contact us at:
            </Text>
            <Text style={styles.contactEmail}>Email: team@strmly.com</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoints: {
    marginLeft: 8,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 4,
  },
  grievanceInfo: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  grievanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 4,
  },
  grievanceValue: {
    fontSize: 14,
    color: '#4A9EFF',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#4A9EFF',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default PrivacyPolicy;