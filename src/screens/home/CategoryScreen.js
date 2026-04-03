import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    Dimensions,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation, route }) => {
    const { category } = route.params; // Category passed from Home screen
    const { colors, gradients, isDark } = useTheme();
    const theme = colors; // Map local 'theme' usage to 'colors' from useTheme

    // State
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [selectedRating, setSelectedRating] = useState(0);
    const [sortBy, setSortBy] = useState('Popular');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');

    // Constants
    const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];
    const sortOptions = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Rating', 'Discount'];

    // Category data with subcategories
    const categoryData = {
        Fashion: {
            icon: '👕',
            color: '#FF6B6B',
            subcategories: ['All', 'Men', 'Women', 'Kids', 'Accessories', 'Shoes'],
        },
        Electronics: {
            icon: '📱',
            color: '#4ECDC4',
            subcategories: ['All', 'Phones', 'Laptops', 'Tablets', 'Audio', 'Cameras'],
        },
        Home: {
            icon: '🏠',
            color: '#95E1D3',
            subcategories: ['All', 'Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage'],
        },
        Beauty: {
            icon: '💄',
            color: '#F38181',
            subcategories: ['All', 'Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Tools'],
        },
        Sports: {
            icon: '⚽',
            color: '#AA96DA',
            subcategories: ['All', 'Fitness', 'Outdoor', 'Team Sports', 'Yoga', 'Cycling'],
        },
        Books: {
            icon: '📚',
            color: '#FCBAD3',
            subcategories: ['All', 'Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Magazines'],
        },
        Tech: {
            icon: '💻',
            color: '#00D9FF',
            subcategories: ['All', 'Computers', 'Accessories', 'Gaming', 'Smart Home', 'Wearables'],
        },
        Jewels: {
            icon: '💎',
            color: '#FFD700',
            subcategories: ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'],
        },
    };

    const currentCategory = categoryData[category] || categoryData.Fashion;

    // Mock products data
    const mockProductsByCategory = {
        Fashion: [
            {
                id: '1',
                name: 'Nike Air Max 270',
                price: 4299,
                originalPrice: 7000,
                discount: 39,
                rating: 4.5,
                reviews: 892,
                image: '👟',
                condition: 'New',
                badge: 'HOT',
                subcategory: 'Shoes',
            },
            {
                id: '2',
                name: 'Adidas Ultraboost',
                price: 3999,
                originalPrice: 6500,
                discount: 38,
                rating: 4.4,
                reviews: 654,
                image: '👟',
                condition: 'New',
                badge: null,
                subcategory: 'Shoes',
            },
            {
                id: '3',
                name: 'Levis Denim Jacket',
                price: 2499,
                originalPrice: 4999,
                discount: 50,
                rating: 4.6,
                reviews: 423,
                image: '🧥',
                condition: 'Like New',
                badge: 'TOP RATED',
                subcategory: 'Men',
            },
            {
                id: '4',
                name: 'Ray-Ban Aviator',
                price: 5999,
                originalPrice: 8999,
                discount: 33,
                rating: 4.8,
                reviews: 1243,
                image: '🕶️',
                condition: 'New',
                badge: 'EXCLUSIVE',
                subcategory: 'Accessories',
            },
            {
                id: '5',
                name: 'Calvin Klein Watch',
                price: 7999,
                originalPrice: 12000,
                discount: 33,
                rating: 4.7,
                reviews: 567,
                image: '⌚',
                condition: 'New',
                badge: null,
                subcategory: 'Accessories',
            },
            {
                id: '6',
                name: 'Puma Sneakers',
                price: 2999,
                originalPrice: 4999,
                discount: 40,
                rating: 4.3,
                reviews: 234,
                image: '👟',
                condition: 'Good',
                badge: null,
                subcategory: 'Shoes',
            },
        ],
        Electronics: [
            {
                id: '1',
                name: 'iPhone 15 Pro Max',
                price: 129900,
                originalPrice: 149900,
                discount: 13,
                rating: 4.8,
                reviews: 2156,
                image: '📱',
                condition: 'New',
                badge: 'EXCLUSIVE',
                subcategory: 'Phones',
            },
            {
                id: '2',
                name: 'MacBook Pro M3',
                price: 199900,
                originalPrice: 229900,
                discount: 13,
                rating: 4.9,
                reviews: 1543,
                image: '💻',
                condition: 'New',
                badge: 'NEW',
                subcategory: 'Laptops',
            },
            {
                id: '3',
                name: 'Sony WH-1000XM5',
                price: 34900,
                originalPrice: 39900,
                discount: 13,
                rating: 4.7,
                reviews: 3421,
                image: '🎧',
                condition: 'Like New',
                badge: 'TOP RATED',
                subcategory: 'Audio',
            },
            {
                id: '4',
                name: 'iPad Air M2',
                price: 59900,
                originalPrice: 69900,
                discount: 14,
                rating: 4.6,
                reviews: 987,
                image: '📱',
                condition: 'New',
                badge: null,
                subcategory: 'Tablets',
            },
            {
                id: '5',
                name: 'Canon EOS R6',
                price: 234900,
                originalPrice: 279900,
                discount: 16,
                rating: 4.8,
                reviews: 456,
                image: '📷',
                condition: 'New',
                badge: 'HOT',
                subcategory: 'Cameras',
            },
            {
                id: '6',
                name: 'Samsung Galaxy S24',
                price: 79900,
                originalPrice: 99900,
                discount: 20,
                rating: 4.5,
                reviews: 1876,
                image: '📱',
                condition: 'New',
                badge: null,
                subcategory: 'Phones',
            },
        ],
        // Default for other categories
        Default: [
            {
                id: '1',
                name: `${category} Item 1`,
                price: 2499,
                originalPrice: 3999,
                discount: 37,
                rating: 4.5,
                reviews: 234,
                image: currentCategory.icon,
                condition: 'New',
                badge: 'HOT',
                subcategory: 'All',
            },
            {
                id: '2',
                name: `${category} Item 2`,
                price: 3499,
                originalPrice: 5999,
                discount: 42,
                rating: 4.6,
                reviews: 456,
                image: currentCategory.icon,
                condition: 'New',
                badge: 'NEW',
                subcategory: 'All',
            },
            {
                id: '3',
                name: `${category} Item 3`,
                price: 4999,
                originalPrice: 7999,
                discount: 37,
                rating: 4.4,
                reviews: 123,
                image: currentCategory.icon,
                condition: 'Like New',
                badge: null,
                subcategory: 'All',
            },
            {
                id: '4',
                name: `${category} Item 4`,
                price: 1999,
                originalPrice: 2999,
                discount: 33,
                rating: 4.7,
                reviews: 678,
                image: currentCategory.icon,
                condition: 'New',
                badge: 'TOP RATED',
                subcategory: 'All',
            },
        ],
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [products, selectedSubCategory, selectedCondition, selectedRating, priceRange, sortBy]);

    const loadProducts = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const categoryProducts = mockProductsByCategory[category] || mockProductsByCategory.Default;
            setProducts(categoryProducts);
            setLoading(false);
        }, 1000);
    };

    const applyFiltersAndSort = () => {
        let filtered = [...products];

        // Apply subcategory filter
        if (selectedSubCategory !== 'All') {
            filtered = filtered.filter((p) => p.subcategory === selectedSubCategory);
        }

        // Apply condition filter
        if (selectedCondition !== 'All') {
            filtered = filtered.filter((p) => p.condition === selectedCondition);
        }

        // Apply rating filter
        if (selectedRating > 0) {
            filtered = filtered.filter((p) => p.rating >= selectedRating);
        }

        // Apply price range filter
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
            case 'Discount':
                filtered.sort((a, b) => b.discount - a.discount);
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const clearAllFilters = () => {
        setSelectedSubCategory('All');
        setPriceRange([0, 100000]);
        setSelectedCondition('All');
        setSelectedRating(0);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedSubCategory !== 'All') count++;
        if (selectedCondition !== 'All') count++;
        if (selectedRating > 0) count++;
        if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
        return count;
    };

    // Render Product Card
    const renderProductCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: theme.cardBackground }]}
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
                <Ionicons name="heart-outline" size={20} color={theme.text} />
            </View>

            <View style={styles.productImage}>
                <Text style={styles.productEmoji}>{item.image}</Text>
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.rating, { color: theme.textSecondary }]}>
                        {item.rating}
                    </Text>
                    <Text style={[styles.reviews, { color: theme.textSecondary }]}>
                        ({item.reviews})
                    </Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: theme.primary }]}>
                        ₹{item.price.toLocaleString()}
                    </Text>
                    {item.originalPrice && (
                        <>
                            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
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
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={clearAllFilters}>
                            <Text style={[styles.clearButton, { color: theme.primary }]}>Clear All</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Subcategory Filter */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: theme.text }]}>
                                {category} Category
                            </Text>
                            <View style={styles.filterOptions}>
                                {currentCategory.subcategories.map((sub) => (
                                    <TouchableOpacity
                                        key={sub}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor:
                                                    selectedSubCategory === sub
                                                        ? theme.primary
                                                        : theme.cardBackground,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedSubCategory(sub)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                {
                                                    color:
                                                        selectedSubCategory === sub
                                                            ? '#FFFFFF'
                                                            : theme.textSecondary,
                                                },
                                            ]}
                                        >
                                            {sub}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: theme.text }]}>Price Range</Text>
                            <View style={styles.priceRangeContainer}>
                                <View style={styles.priceInputWrapper}>
                                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                                        Min
                                    </Text>
                                    <View
                                        style={[
                                            styles.priceInputBox,
                                            { backgroundColor: theme.cardBackground },
                                        ]}
                                    >
                                        <Text style={[styles.rupeeSymbol, { color: theme.text }]}>₹</Text>
                                        <TextInput
                                            style={[styles.priceInput, { color: theme.text }]}
                                            placeholder="0"
                                            placeholderTextColor={theme.textSecondary}
                                            keyboardType="numeric"
                                            value={priceRange[0].toString()}
                                            onChangeText={(text) =>
                                                setPriceRange([parseInt(text) || 0, priceRange[1]])
                                            }
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.priceSeparator, { color: theme.textSecondary }]}>
                                    —
                                </Text>

                                <View style={styles.priceInputWrapper}>
                                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                                        Max
                                    </Text>
                                    <View
                                        style={[
                                            styles.priceInputBox,
                                            { backgroundColor: theme.cardBackground },
                                        ]}
                                    >
                                        <Text style={[styles.rupeeSymbol, { color: theme.text }]}>₹</Text>
                                        <TextInput
                                            style={[styles.priceInput, { color: theme.text }]}
                                            placeholder="100000"
                                            placeholderTextColor={theme.textSecondary}
                                            keyboardType="numeric"
                                            value={priceRange[1].toString()}
                                            onChangeText={(text) =>
                                                setPriceRange([priceRange[0], parseInt(text) || 100000])
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Condition Filter */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterTitle, { color: theme.text }]}>Condition</Text>
                            <View style={styles.filterOptions}>
                                {conditions.map((condition) => (
                                    <TouchableOpacity
                                        key={condition}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor:
                                                    selectedCondition === condition
                                                        ? theme.primary
                                                        : theme.cardBackground,
                                                borderColor: theme.border,
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
                                                            ? '#FFFFFF'
                                                            : theme.textSecondary,
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
                            <Text style={[styles.filterTitle, { color: theme.text }]}>
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
                                                        ? theme.primary
                                                        : theme.cardBackground,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedRating(rating)}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={16}
                                            color={selectedRating === rating ? '#FFFFFF' : '#FFD700'}
                                        />
                                        <Text
                                            style={[
                                                styles.ratingOptionText,
                                                {
                                                    color:
                                                        selectedRating === rating ? '#FFFFFF' : theme.textSecondary,
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
                        style={[styles.applyButton, { backgroundColor: theme.primary }]}
                        onPress={() => setShowFilterModal(false)}
                    >
                        <Text style={styles.applyButtonText}>
                            Show {filteredProducts.length} Products
                        </Text>
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
                <View
                    style={[styles.sortModalContent, { backgroundColor: theme.background }]}
                >
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Sort By</Text>
                        <TouchableOpacity onPress={() => setShowSortModal(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.sortOption, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                setSortBy(option);
                                setShowSortModal(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    {
                                        color: sortBy === option ? theme.primary : theme.text,
                                        fontWeight: sortBy === option ? '600' : '400',
                                    },
                                ]}
                            >
                                {option}
                            </Text>
                            {sortBy === option && (
                                <Ionicons name="checkmark" size={20} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[currentCategory.color, theme.background]}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Search', { query: category })}
                        style={styles.searchButton}
                    >
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerContent}>
                    <Text style={styles.categoryIcon}>{currentCategory.icon}</Text>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.productCount}>
                        {filteredProducts.length} Products
                    </Text>
                </View>
            </LinearGradient>

            {/* Subcategory Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: theme.background }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabs}
                >
                    {currentCategory.subcategories.map((sub) => (
                        <TouchableOpacity
                            key={sub}
                            style={[
                                styles.tab,
                                {
                                    backgroundColor:
                                        selectedSubCategory === sub
                                            ? theme.primary
                                            : theme.cardBackground,
                                },
                            ]}
                            onPress={() => setSelectedSubCategory(sub)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color:
                                            selectedSubCategory === sub ? '#FFFFFF' : theme.textSecondary,
                                    },
                                ]}
                            >
                                {sub}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Filter & Sort Bar */}
            <View style={[styles.filterBar, { backgroundColor: theme.background }]}>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme.cardBackground }]}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons name="options-outline" size={18} color={theme.text} />
                    <Text style={[styles.filterButtonText, { color: theme.text }]}>Filters</Text>
                    {getActiveFiltersCount() > 0 && (
                        <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: theme.cardBackground }]}
                    onPress={() => setShowSortModal(true)}
                >
                    <Ionicons name="swap-vertical-outline" size={18} color={theme.text} />
                    <Text style={[styles.sortButtonText, { color: theme.text }]}>{sortBy}</Text>
                </TouchableOpacity>
            </View>

            {/* Products Grid */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading {category}...
                    </Text>
                </View>
            ) : filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                        No Products Found
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Try adjusting your filters
                    </Text>
                    <TouchableOpacity
                        style={[styles.clearFiltersButton, { backgroundColor: theme.primary }]}
                        onPress={clearAllFilters}
                    >
                        <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modals */}
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
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    categoryIcon: {
        fontSize: 60,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    productCount: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    tabsContainer: {
        paddingVertical: 12,
    },
    tabs: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
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
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
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
    priceInputWrapper: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    priceInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    rupeeSymbol: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
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

export default CategoryScreen;