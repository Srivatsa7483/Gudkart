import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    Dimensions,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();

    // State
    const [searchQuery, setSearchQuery] = useState(route?.params?.query || '');
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([
        'Smartphone',
        'Laptop',
        'Sneakers',
        'Watch',
    ]);
    const [popularSearches] = useState([
        'iPhone 15 Pro',
        'MacBook Air M2',
        'Nike Air Max',
        'Samsung Galaxy S24',
        'Sony Headphones',
        'Apple Watch',
    ]);

    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [selectedRating, setSelectedRating] = useState(0);
    const [sortBy, setSortBy] = useState('Relevance');

    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Categories
    const categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Books'];
    const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];
    const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Popular', 'Rating'];

    // Mock products data
    const mockProducts = [
        {
            id: '1',
            name: 'iPhone 15 Pro Max',
            price: 1299,
            originalPrice: 1499,
            discount: 13,
            rating: 4.8,
            reviews: 2156,
            image: '📱',
            category: 'Electronics',
            condition: 'New',
            badge: 'EXCLUSIVE',
        },
        {
            id: '2',
            name: 'Nike Air Max 270',
            price: 4299,
            originalPrice: 7000,
            discount: 39,
            rating: 4.5,
            reviews: 892,
            image: '👟',
            category: 'Fashion',
            condition: 'New',
            badge: 'HOT',
        },
        {
            id: '3',
            name: 'MacBook Pro M3',
            price: 1999,
            originalPrice: 2299,
            discount: 13,
            rating: 4.9,
            reviews: 1543,
            image: '💻',
            category: 'Electronics',
            condition: 'New',
            badge: 'NEW',
        },
        {
            id: '4',
            name: 'Sony WH-1000XM5',
            price: 349,
            originalPrice: 399,
            discount: 13,
            rating: 4.7,
            reviews: 3421,
            image: '🎧',
            category: 'Electronics',
            condition: 'Like New',
            badge: 'TOP RATED',
        },
        {
            id: '5',
            name: 'Samsung Galaxy Watch',
            price: 299,
            originalPrice: 449,
            discount: 33,
            rating: 4.6,
            reviews: 1876,
            image: '⌚',
            category: 'Electronics',
            condition: 'New',
            badge: null,
        },
        {
            id: '6',
            name: 'Adidas Ultraboost',
            price: 3999,
            originalPrice: 6500,
            discount: 38,
            rating: 4.4,
            reviews: 654,
            image: '👟',
            category: 'Fashion',
            condition: 'Good',
            badge: null,
        },
    ];

    useEffect(() => {
        if (route?.params?.query) {
            handleSearch(route.params.query);
        }
    }, [route?.params?.query]);

    // Search handler
    const handleSearch = (query) => {
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);

        // Add to recent searches
        if (!recentSearches.includes(query)) {
            setRecentSearches([query, ...recentSearches.slice(0, 4)]);
        }

        // Simulate API call
        setTimeout(() => {
            let filtered = mockProducts.filter((product) =>
                product.name.toLowerCase().includes(query.toLowerCase())
            );

            // Apply filters
            if (selectedCategory !== 'All') {
                filtered = filtered.filter((p) => p.category === selectedCategory);
            }
            if (selectedCondition !== 'All') {
                filtered = filtered.filter((p) => p.condition === selectedCondition);
            }
            if (selectedRating > 0) {
                filtered = filtered.filter((p) => p.rating >= selectedRating);
            }
            filtered = filtered.filter(
                (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
            );

            // Apply sorting
            switch (sortBy) {
                case 'Price: Low to High':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'Price: High to Low':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'Rating':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'Newest':
                    // In real app, sort by date
                    break;
                case 'Popular':
                    filtered.sort((a, b) => b.reviews - a.reviews);
                    break;
                default:
                    break;
            }

            setSearchResults(filtered);
            setLoading(false);
        }, 800);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const clearAllFilters = () => {
        setSelectedCategory('All');
        setPriceRange([0, 100000]);
        setSelectedCondition('All');
        setSelectedRating(0);
        setSortBy('Relevance');
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedCategory !== 'All') count++;
        if (selectedCondition !== 'All') count++;
        if (selectedRating > 0) count++;
        if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
        return count;
    };

    // Render Product Card
    const renderProductCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            activeOpacity={0.7}
        >
            {item.badge && (
                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor:
                                item.badge === 'EXCLUSIVE'
                                    ? '#FFD700'
                                    : item.badge === 'HOT'
                                        ? '#FF6B6B'
                                        : item.badge === 'NEW'
                                            ? '#00D9FF'
                                            : '#4CAF50',
                        },
                    ]}
                >
                    <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
            )}

            <View style={styles.wishlistButton}>
                <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.productImage}>
                <Text style={styles.productEmoji}>{item.image}</Text>
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.rating, { color: colors.textSecondary }]}>
                        {item.rating}
                    </Text>
                    <Text style={[styles.reviews, { color: colors.textMuted }]}>
                        ({item.reviews})
                    </Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colors.accent }]}>
                        ₹{item.price.toLocaleString()}
                    </Text>
                    {item.originalPrice && (
                        <>
                            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                                ₹{item.originalPrice.toLocaleString()}
                            </Text>
                            <Text style={styles.discount}>{item.discount}% OFF</Text>
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Render Filter Modal
    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={clearAllFilters}>
                            <Text style={[styles.clearButton, { color: colors.accent }]}>Clear All</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Category Filter */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Category</Text>
                            <View style={styles.filterOptions}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor:
                                                    selectedCategory === category
                                                        ? colors.accent
                                                        : colors.card,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedCategory(category)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                {
                                                    color:
                                                        selectedCategory === category
                                                            ? '#1A0B2E'
                                                            : colors.textSecondary,
                                                },
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Price Range</Text>
                            <View style={styles.priceRangeContainer}>
                                <TextInput
                                    style={[
                                        styles.priceInput,
                                        { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border },
                                    ]}
                                    placeholder="Min"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={priceRange[0].toString()}
                                    onChangeText={(text) =>
                                        setPriceRange([parseInt(text) || 0, priceRange[1]])
                                    }
                                />
                                <Text style={[styles.priceSeparator, { color: colors.textMuted }]}>
                                    to
                                </Text>
                                <TextInput
                                    style={[
                                        styles.priceInput,
                                        { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border },
                                    ]}
                                    placeholder="Max"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={priceRange[1].toString()}
                                    onChangeText={(text) =>
                                        setPriceRange([priceRange[0], parseInt(text) || 100000])
                                    }
                                />
                            </View>
                        </View>

                        {/* Condition Filter */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Condition</Text>
                            <View style={styles.filterOptions}>
                                {conditions.map((condition) => (
                                    <TouchableOpacity
                                        key={condition}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor:
                                                    selectedCondition === condition
                                                        ? colors.accent
                                                        : colors.card,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedCondition(condition)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                {
                                                    color:
                                                        selectedCondition === condition
                                                            ? '#1A0B2E'
                                                            : colors.textSecondary,
                                                },
                                            ]}
                                        >
                                            {condition}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Rating Filter */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
                                Minimum Rating
                            </Text>
                            <View style={styles.ratingFilter}>
                                {[0, 3, 4, 4.5].map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        style={[
                                            styles.ratingOption,
                                            {
                                                backgroundColor:
                                                    selectedRating === rating
                                                        ? colors.accent
                                                        : colors.card,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedRating(rating)}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={16}
                                            color={selectedRating === rating ? '#1A0B2E' : '#FFD700'}
                                        />
                                        <Text
                                            style={[
                                                styles.ratingOptionText,
                                                {
                                                    color:
                                                        selectedRating === rating ? '#1A0B2E' : colors.textSecondary,
                                                },
                                            ]}
                                        >
                                            {rating === 0 ? 'All' : `${rating}+`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Button */}
                    <TouchableOpacity
                        style={[styles.applyButton, { backgroundColor: colors.accent }]}
                        onPress={() => {
                            setShowFilterModal(false);
                            handleSearch(searchQuery);
                        }}
                    >
                        <Text style={[styles.applyButtonText, { color: '#1A0B2E' }]}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Render Sort Modal
    const renderSortModal = () => (
        <Modal
            visible={showSortModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSortModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.sortModalContent, { backgroundColor: colors.surface }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Sort By</Text>
                        <TouchableOpacity onPress={() => setShowSortModal(false)}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.sortOption, { borderBottomColor: colors.border }]}
                            onPress={() => {
                                setSortBy(option);
                                setShowSortModal(false);
                                handleSearch(searchQuery);
                            }}
                        >
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    {
                                        color: sortBy === option ? colors.accent : colors.textPrimary,
                                        fontWeight: sortBy === option ? '600' : '400',
                                    },
                                ]}
                            >
                                {option}
                            </Text>
                            {sortBy === option && (
                                <Ionicons name="checkmark" size={20} color={colors.accent} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
                <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            placeholder="Search products..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => handleSearch(searchQuery)}
                            returnKeyType="search"
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch}>
                                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {/* Filter & Sort Bar */}
            {hasSearched && (
                <View style={[styles.filterBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
                        <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>Filters</Text>
                        {getActiveFiltersCount() > 0 && (
                            <View style={[styles.filterBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.filterBadgeText, { color: '#1A0B2E' }]}>{getActiveFiltersCount()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Ionicons name="swap-vertical-outline" size={18} color={colors.textPrimary} />
                        <Text style={[styles.sortButtonText, { color: colors.textPrimary }]}>{sortBy}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Content */}
            {!hasSearched ? (
                <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
                    {recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                                Recent Searches
                            </Text>
                            {recentSearches.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.searchItem, { borderBottomColor: colors.border }]}
                                    onPress={() => { setSearchQuery(item); handleSearch(item); }}
                                >
                                    <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                                    <Text style={[styles.searchItemText, { color: colors.textPrimary }]}>
                                        {item}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setRecentSearches(recentSearches.filter((_, i) => i !== index))}
                                    >
                                        <Ionicons name="close" size={18} color={colors.textMuted} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            Popular Searches
                        </Text>
                        <View style={styles.popularChips}>
                            {popularSearches.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.popularChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => { setSearchQuery(item); handleSearch(item); }}
                                >
                                    <Text style={[styles.popularChipText, { color: colors.textPrimary }]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            ) : loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Searching products...
                    </Text>
                </View>
            ) : searchResults.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Results Found</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        We couldn't find any products matching "{searchQuery}"
                    </Text>
                    <TouchableOpacity
                        style={[styles.clearFiltersButton, { backgroundColor: colors.accent }]}
                        onPress={clearAllFilters}
                    >
                        <Text style={[styles.clearFiltersButtonText, { color: '#1A0B2E' }]}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.resultsContainer}>
                    <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                        {searchResults.length} results found
                    </Text>
                    <FlatList
                        data={searchResults}
                        renderItem={renderProductCard}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {renderFilterModal()}
            {renderSortModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backButton: {
        marginRight: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 12,
    },
    searchItemText: {
        flex: 1,
        fontSize: 15,
    },
    popularChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    popularChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    popularChipText: {
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    clearFiltersButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    clearFiltersButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    resultsCount: {
        fontSize: 14,
        marginVertical: 12,
    },
    row: {
        justifyContent: 'space-between',
        gap: 12,
    },
    gridContent: {
        paddingBottom: 20,
    },
    productCard: {
        width: (width - 44) / 2,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 1,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    wishlistButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
    },
    productImage: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    productEmoji: {
        fontSize: 60,
    },
    productInfo: {
        gap: 6,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        height: 36,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '500',
    },
    reviews: {
        fontSize: 11,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    discount: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
    },
    sortModalContent: {
        maxHeight: '60%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    clearButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 20,
    },
    filterSection: {
        marginTop: 24,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    priceInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 14,
    },
    priceSeparator: {
        fontSize: 14,
    },
    ratingFilter: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 4,
    },
    ratingOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    applyButton: {
        marginHorizontal: 20,
        marginTop: 12,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    sortOptionText: {
        fontSize: 15,
    },
});

export default SearchScreen;