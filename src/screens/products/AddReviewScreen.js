import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const AddReviewScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const { product } = route.params; // Expects { id, name, emoji }

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Animation for stars
    const starScale = useRef(new Animated.Value(1)).current;

    const animateStar = () => {
        Animated.sequence([
            Animated.timing(starScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.timing(starScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handleRating = (r) => {
        setRating(r);
        animateStar();
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select at least 1 star.');
            return;
        }

        setIsSubmitting(true);
        // Simulating API call
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                'Review Submitted',
                'Thank you for your feedback! It helps other shoppers.',
                [{ text: 'Great!', onPress: () => navigation.goBack() }]
            );
        }, 1500);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Write a Review</Text>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Product Card */}
                    <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.productIconBox, { backgroundColor: colors.accent + '15' }]}>
                            <Text style={styles.productEmoji}>{product?.emoji || '📦'}</Text>
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                                {product?.name || 'Unknown Product'}
                            </Text>
                            <Text style={[styles.shareText, { color: colors.textSecondary }]}>
                                Share your experience with this item
                            </Text>
                        </View>
                    </View>

                    {/* Star Rating Section */}
                    <View style={styles.ratingSection}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overall Rating</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    activeOpacity={0.7}
                                    onPress={() => handleRating(star)}
                                >
                                    <Animated.View style={{ transform: [{ scale: rating === star ? starScale : 1 }] }}>
                                        <Ionicons
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={44}
                                            color={star <= rating ? '#FFD700' : colors.textMuted}
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.ratingLabel, { color: rating > 0 ? colors.accent : colors.textMuted }]}>
                            {rating === 1 ? 'Poor' : 
                             rating === 2 ? 'Fair' : 
                             rating === 3 ? 'Good' : 
                             rating === 4 ? 'Very Good' : 
                             rating === 5 ? 'Excellent!' : 'Tap a star to rate'}
                        </Text>
                    </View>

                    {/* Comment Section */}
                    <View style={styles.commentSection}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Review</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="What did you like or dislike? How was the quality? (Optional)"
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={6}
								textAlignVertical="top"
                                value={comment}
                                onChangeText={setComment}
                            />
                        </View>
                        <Text style={[styles.charCount, { color: colors.textMuted }]}>
                            {comment.length} characters
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <LinearGradient
                        colors={gradients.button}
                        style={styles.submitBtnGradient}
                    >
                        {isSubmitting ? (
                            <Text style={styles.submitBtnText}>Submitting...</Text>
                        ) : (
                            <Text style={styles.submitBtnText}>Submit Review</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 20,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 32,
    },
    productIconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productEmoji: {
        fontSize: 32,
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    shareText: {
        fontSize: 12,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
		alignSelf: 'flex-start',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    ratingLabel: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    commentSection: {
        marginBottom: 32,
    },
    inputWrapper: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        minHeight: 150,
    },
    input: {
        fontSize: 14,
        lineHeight: 22,
    },
    charCount: {
        textAlign: 'right',
        marginTop: 8,
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
    },
    submitBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitBtnGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddReviewScreen;
