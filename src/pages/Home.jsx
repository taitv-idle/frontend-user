import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_products } from '../store/reducers/homeReducer';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Categorys from '../components/Categorys';
import FeatureProducts from '../components/products/FeatureProducts';
import Products from '../components/products/Products';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import LoadingSkeleton from '../components/HomeSkeleton';

const Home = () => {
    const dispatch = useDispatch();
    const { products, latest_product, topRated_product, discount_product, loading } = useSelector(state => state.home);

    useEffect(() => {
        dispatch(get_products());
    }, [dispatch]);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                <Banner />

                <section className="py-12 bg-gradient-to-b from-white to-rose-50/20">
                    <Categorys />
                </section>

                <section className="py-16 bg-white">
                    <FeatureProducts products={products} />
                </section>

                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="animate-fade-in-up delay-100">
                                <Products
                                    title="Sản Phẩm Mới"
                                    products={latest_product}
                                    bgColor="bg-rose-100"
                                />
                            </div>

                            <div className="animate-fade-in-up delay-200">
                                <Products
                                    title="Bán Chạy Nhất"
                                    products={topRated_product}
                                    bgColor="bg-amber-100"
                                />
                            </div>

                            <div className="animate-fade-in-up delay-300">
                                <Products
                                    title="Khuyến Mãi Hot"
                                    products={discount_product}
                                    bgColor="bg-emerald-100"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Home;