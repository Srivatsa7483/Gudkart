import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

// Shimmer animation component
const ShimmerPlaceholder = ({ width, height, borderRadius = 8, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: '#E1E9EE',
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Product card skeleton
export const ProductCardSkeleton = ({ colors }) => (
    <View style={[styles.productCard, { backgroundColor: colors.surface }]}>
        {/* Image skeleton */}
        <View style={[styles.imageContainer, { backgroundColor: colors.cardAlt }]}>
            <ShimmerPlaceholder width={ITEM_WIDTH * 0.6} height={ITEM_WIDTH * 0.6} borderRadius={12} />
        </View>

        {/* Info skeleton */}
        <View style={styles.infoArea}>
            <ShimmerPlaceholder width="60%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="90%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="70%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="50%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="40%" height={16} borderRadius={4} />
        </View>
    </View>
);

// Product grid skeleton (for list view)
export const ProductListSkeleton = ({ colors, count = 6 }) => (
    <View style={styles.gridContainer}>
        {Array.from({ length: count }).map((_, index) => (
            <ProductCardSkeleton key={index} colors={colors} />
        ))}
    </View>
);

// Product detail skeleton
export const ProductDetailSkeleton = ({ colors }) => (
    <View style={[styles.detailContainer, { backgroundColor: colors.background }]}>
        {/* Image carousel skeleton */}
        <ShimmerPlaceholder width={width} height={width * 0.8} borderRadius={0} />

        <View style={styles.detailContent}>
            {/* Title and rating */}
            <ShimmerPlaceholder width="80%" height={24} borderRadius={6} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="40%" height={16} borderRadius={4} style={{ marginBottom: 16 }} />

            {/* Price */}
            <ShimmerPlaceholder width="50%" height={28} borderRadius={6} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="30%" height={16} borderRadius={4} style={{ marginBottom: 24 }} />

            {/* Color selector */}
            <ShimmerPlaceholder width="30%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
            <View style={styles.colorRow}>
                {[1, 2, 3].map((i) => (
                    <ShimmerPlaceholder key={i} width={32} height={32} borderRadius={16} />
                ))}
            </View>

            {/* Highlights */}
            <View style={{ marginTop: 24, marginBottom: 24 }}>
                <ShimmerPlaceholder width="40%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
                <View style={styles.highlightRow}>
                    {[1, 2, 3].map((i) => (
                        <ShimmerPlaceholder key={i} width={100} height={32} borderRadius={16} />
                    ))}
                </View>
            </View>

            {/* Description */}
            <ShimmerPlaceholder width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="95%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="85%" height={14} borderRadius={4} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    productCard: {
        width: ITEM_WIDTH,
        marginBottom: 16,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: ITEM_WIDTH * 1.1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoArea: {
        padding: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    detailContainer: {
        flex: 1,
    },
    detailContent: {
        padding: 20,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    highlightRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
});

export default {
    ProductCardSkeleton,
    ProductListSkeleton,
    ProductDetailSkeleton,
    ShimmerPlaceholder,
};