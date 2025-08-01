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

const TermsAndConditions = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>TERMS AND CONDITIONS FOR STRMLY Technologies.Pvt.Ltd</Text>
          <Text style={styles.lastUpdated}>Last Updated: July 30, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
            <Text style={styles.sectionText}>
              By downloading, installing, accessing, or using the Strmly mobile application ("App"),
              you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to
              these Terms, do not use the App.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. DESCRIPTION OF SERVICE</Text>
            <Text style={styles.sectionText}>
              Strmly is a video streaming and content creation platform that allows users to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Upload, share, and view video content</Text>
              <Text style={styles.bulletPoint}>• Create and join communities</Text>
              <Text style={styles.bulletPoint}>• Purchase and sell video series and individual videos</Text>
              <Text style={styles.bulletPoint}>• Use creator passes for subscription-based content access</Text>
              <Text style={styles.bulletPoint}>• Send tips and gifts to content creators</Text>
              <Text style={styles.bulletPoint}>• Manage digital wallets for transactions</Text>
              <Text style={styles.bulletPoint}>• Access premium content through paid subscriptions</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. ELIGIBILITY AND AGE REQUIREMENTS</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• You must be at least 13 years old to use this App.</Text>
              <Text style={styles.bulletPoint}>• Users between 13-17 must have parental consent.</Text>
              <Text style={styles.bulletPoint}>• Users must be at least 18 years old to access monetization features, make purchases, or receive payments.</Text>
              <Text style={styles.bulletPoint}>• By using the App, you represent that you meet these age requirements.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. USER ACCOUNTS AND REGISTRATION</Text>
            <Text style={styles.subsectionTitle}>4.1 Account Creation</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• You must provide accurate, current, and complete information during registration.</Text>
              <Text style={styles.bulletPoint}>• You are responsible for maintaining the confidentiality of your account credentials.</Text>
              <Text style={styles.bulletPoint}>• You may register using email/password or Google OAuth.</Text>
              <Text style={styles.bulletPoint}>• Email verification is required before accessing full App features.</Text>
              <Text style={styles.bulletPoint}>• By signing up or creating an account, you agree to share the required details with us, such as your email and password, for app functionality and account management.</Text>
            </View>

            <Text style={styles.subsectionTitle}>4.2 Account Security</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• You are responsible for all activities under your account.</Text>
              <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized access.</Text>
              <Text style={styles.bulletPoint}>• We may suspend or terminate accounts that violate these Terms.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. USER-GENERATED CONTENT</Text>
            <Text style={styles.subsectionTitle}>5.1 Content Guidelines</Text>
            <Text style={styles.sectionText}>You agree not to upload, post, or share content that:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Is illegal, harmful, threatening, abusive, or defamatory</Text>
              <Text style={styles.bulletPoint}>• Contains nudity, sexual content, or is inappropriate for minors</Text>
              <Text style={styles.bulletPoint}>• Violates intellectual property rights</Text>
              <Text style={styles.bulletPoint}>• Contains malware, viruses, or harmful code</Text>
              <Text style={styles.bulletPoint}>• Promotes violence, hate speech, or discrimination</Text>
              <Text style={styles.bulletPoint}>• Is spam, misleading, or fraudulent</Text>
            </View>

            <Text style={styles.subsectionTitle}>5.2 Content Ownership and Licensing</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• You retain ownership of content you create and upload</Text>
              <Text style={styles.bulletPoint}>• By uploading content, you grant Strmly a worldwide, non-exclusive license to host, display, and distribute your content</Text>
              <Text style={styles.bulletPoint}>• You represent that you have all necessary rights to the content you upload</Text>
              <Text style={styles.bulletPoint}>• We may remove content that violates these Terms without notice</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. MONETIZATION AND PAYMENTS</Text>
            <Text style={styles.subsectionTitle}>6.1 Digital Wallet System</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Users can load money into their digital wallets using a payment gateway</Text>
              <Text style={styles.bulletPoint}>• Wallet funds can be used to purchase content, send tips, or pay community fees</Text>
              <Text style={styles.bulletPoint}>• All transactions are processed securely through our payment partners</Text>
              <Text style={styles.bulletPoint}>• Strmly reserves the right to restrict, block, or remove digital wallet rights for users who violate the App's rules and Terms</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.2 Creator Monetization</Text>
            <Text style={styles.sectionText}>Creators can earn money through:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Paid video series and individual videos</Text>
              <Text style={styles.bulletPoint}>• Creator Pass subscriptions (monthly recurring)</Text>
              <Text style={styles.bulletPoint}>• Community membership fees (monthly recurring)</Text>
              <Text style={styles.bulletPoint}>• Tips and gifts from viewers</Text>
              <Text style={styles.bulletPoint}>• Comment monetization features</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.3 Revenue Sharing</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Any revenue generated through the App will be subject to a 70/30 split, with creators receiving 70% of the revenue and Strmly retaining 30%</Text>
              <Text style={styles.bulletPoint}>• Additionally, Google Play charges will be applicable wherever deemed necessary for compliance with Android policies</Text>
              <Text style={styles.bulletPoint}>• Community founders receive revenue based on their community settings</Text>
              <Text style={styles.bulletPoint}>• All fees are clearly disclosed before transactions</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.4 Withdrawals</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Creators must verify their bank account or UPI details to withdraw funds</Text>
              <Text style={styles.bulletPoint}>• Minimum withdrawal amounts and processing times apply</Text>
              <Text style={styles.bulletPoint}>• We may hold funds for security and fraud prevention</Text>
              <Text style={styles.bulletPoint}>• When a creator publishes a video series, they must commit to a specified number of episodes as part of that series. Until the committed number of episodes is delivered, any revenue earned through the series will not be sent to their wallet but will be locked by the App</Text>
            </View>

            <Text style={styles.subsectionTitle}>6.5 Refund Policy</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Digital content purchases are generally non-refundable</Text>
              <Text style={styles.bulletPoint}>• Refunds may be considered for technical issues or unauthorized transactions</Text>
              <Text style={styles.bulletPoint}>• Subscription cancellations take effect at the end of the current billing period</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. SUBSCRIPTION SERVICES</Text>
            <Text style={styles.subsectionTitle}>7.1 Creator Pass Subscriptions</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Monthly subscriptions providing access to all content from specific creators</Text>
              <Text style={styles.bulletPoint}>• Auto-renewal unless canceled by user</Text>
              <Text style={styles.bulletPoint}>• 30-day access period from purchase date</Text>
              <Text style={styles.bulletPoint}>• If a creator chooses to discontinue/delete a Creator Pass, they must wait for a period of 45 days before the pass can be permanently deleted. During this 45-day period, no new users can purchase the pass, but existing buyers will retain full access to their content for the entire 45 days</Text>
            </View>

            <Text style={styles.subsectionTitle}>7.2 Community Memberships</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Monthly subscriptions for uploading content to paid communities</Text>
              <Text style={styles.bulletPoint}>• 30-day access period with renewal required</Text>
              <Text style={styles.bulletPoint}>• Access expires if subscription is not renewed</Text>
              <Text style={styles.bulletPoint}>• If a leader finds your actions unfavorable to the spirit of a community, the leader of that community reserves the right to immediately remove any member, even if the community is paid. The kicked-out member will be solely responsible for any loss incurred, and the company will not be involved in any way</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. PRIVACY AND DATA COLLECTION</Text>
            <Text style={styles.subsectionTitle}>8.1 Information We Collect</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Account information (username, email, profile photo)</Text>
              <Text style={styles.bulletPoint}>• Payment and transaction data</Text>
              <Text style={styles.bulletPoint}>• Content metadata and viewing history</Text>
              <Text style={styles.bulletPoint}>• Device information and app usage analytics</Text>
              <Text style={styles.bulletPoint}>• Communication data (comments, messages)</Text>
            </View>

            <Text style={styles.subsectionTitle}>8.2 Use of Information</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Provide and improve our services</Text>
              <Text style={styles.bulletPoint}>• Process payments and transactions</Text>
              <Text style={styles.bulletPoint}>• Send notifications and communications</Text>
              <Text style={styles.bulletPoint}>• Analyze usage patterns and preferences</Text>
              <Text style={styles.bulletPoint}>• Prevent fraud and ensure security</Text>
            </View>

            <Text style={styles.subsectionTitle}>8.3 Data Sharing</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• We do not sell personal information to third parties</Text>
              <Text style={styles.bulletPoint}>• Information may be shared with payment processors and service providers</Text>
              <Text style={styles.bulletPoint}>• We may disclose information as required by law or to protect our rights</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. PROHIBITED ACTIVITIES</Text>
            <Text style={styles.sectionText}>You agree not to:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Use the App for illegal purposes</Text>
              <Text style={styles.bulletPoint}>• Circumvent payment systems or security measures</Text>
              <Text style={styles.bulletPoint}>• Create fake accounts or impersonate others</Text>
              <Text style={styles.bulletPoint}>• Spam, harass, or abuse other users</Text>
              <Text style={styles.bulletPoint}>• Attempt to hack, decompile, or reverse engineer the App</Text>
              <Text style={styles.bulletPoint}>• Use automated systems to access the App</Text>
              <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. COMMUNITY GUIDELINES</Text>
            <Text style={styles.subsectionTitle}>10.1 Respectful Interaction</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Treat all users with respect and courtesy</Text>
              <Text style={styles.bulletPoint}>• No harassment, bullying, or threatening behavior</Text>
              <Text style={styles.bulletPoint}>• Respect diverse opinions and backgrounds</Text>
            </View>

            <Text style={styles.subsectionTitle}>10.2 Content Standards</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Keep content appropriate for the intended audience</Text>
              <Text style={styles.bulletPoint}>• Respect community-specific rules and guidelines</Text>
              <Text style={styles.bulletPoint}>• Report inappropriate content through proper channels</Text>
              <Text style={styles.bulletPoint}>• If you are the sole leader of a community, you cannot leave the community without ensuring a successor. Either a co-founder of the community will take over by default, or you must manually elect a new leader before your departure is finalized</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. TERMINATION</Text>
            <Text style={styles.subsectionTitle}>11.1 Termination by User</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• You may delete your account at any time</Text>
              <Text style={styles.bulletPoint}>• Contact support for account deletion requests</Text>
              <Text style={styles.bulletPoint}>• Some data may be retained for legal and business purposes</Text>
              <Text style={styles.bulletPoint}>• Creator account deletion requests will only be permitted after 45 days from the request date. Within that period, their Creator Pass will be deactivated for new users. If they have communities, they must follow necessary procedures to select a new leader, and their individual content purchased by users from the creator will be available to them forever</Text>
            </View>

            <Text style={styles.subsectionTitle}>11.2 Termination by Strmly</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• We may suspend or terminate accounts for Terms violations</Text>
              <Text style={styles.bulletPoint}>• Repeated policy violations may result in permanent bans</Text>
              <Text style={styles.bulletPoint}>• We reserve the right to refuse service to anyone</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. DISCLAIMERS AND LIMITATIONS</Text>
            <Text style={styles.subsectionTitle}>12.1 Service Availability</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• The App is provided "as is" without warranties</Text>
              <Text style={styles.bulletPoint}>• We do not guarantee uninterrupted service availability</Text>
              <Text style={styles.bulletPoint}>• Features may be modified or discontinued at any time</Text>
              <Text style={styles.bulletPoint}>• In case Google Play removes the App, or if there's an app crash or server crash, the company will take as much time as they deem necessary to resolve the issue</Text>
              <Text style={styles.bulletPoint}>• Any revenue (including Creator Pass and other earnings) accumulated during crashes or periods of app removal will be decided by the company, and nothing is guaranteed</Text>
            </View>

            <Text style={styles.subsectionTitle}>12.2 Limitation of Liability</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Our liability is limited to the maximum extent permitted by law</Text>
              <Text style={styles.bulletPoint}>• We are not liable for user-generated content or third-party actions</Text>
              <Text style={styles.bulletPoint}>• Users are responsible for backing up their content</Text>
              <Text style={styles.bulletPoint}>• The company has no liability if someone steals videos/any other unfair practices within the users</Text>
              <Text style={styles.bulletPoint}>• Payments get stuck mid-transactions; users must contact their bank, not us</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. GOVERNING LAW AND DISPUTES</Text>
            <Text style={styles.subsectionTitle}>13.1 Applicable Law</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• These Terms are governed by the laws of India</Text>
              <Text style={styles.bulletPoint}>• Disputes will be resolved in Indian courts</Text>
            </View>

            <Text style={styles.subsectionTitle}>13.2 Dispute Resolution</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Attempt to resolve disputes through direct communication</Text>
              <Text style={styles.bulletPoint}>• Mediation may be required before litigation</Text>
              <Text style={styles.bulletPoint}>• Class action lawsuits are prohibited</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. CONTACT INFORMATION</Text>
            <Text style={styles.sectionText}>
              For questions about these Terms or the App, contact us at:
            </Text>
            <Text style={styles.contactEmail}>Email: team@strmly.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. EFFECTIVE DATE</Text>
            <Text style={styles.sectionText}>
              These Terms are effective as of July 30, 2025 and apply to all users of the Strmly App.
              By using the App, you acknowledge that you have read, understood, and agree to be bound
              by these Terms and Conditions.
            </Text>
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
  },
  bulletPoint: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#4A9EFF',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default TermsAndConditions;