<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function defaults(): array
    {
        $defaults = [
            'brand_name' => 'BSABShop',
            'logo_path' => null,
            'login_background_path' => null,
            'hero_media_path' => null,
            'hero_media_type' => null,
            'hero_title' => 'Best picks.',
            'hero_highlight' => 'Best prices.',
            'hero_description' => 'Discover products from every category, curated by our marketplace sellers.',
            'cta_label' => 'Shop now',
            'feature_one' => 'Fresh & Quality Products',
            'feature_two' => 'Trusted Sellers',
            'feature_three' => 'Fast & Safe Delivery',
            'products_title' => 'Featured Products',
            'products_subtitle' => 'Handpicked for you. Quality products at the best prices.',
            'footer_text' => '© 2026 BSABShop Marketplace - every price, checked twice.',
            'footer_tagline' => 'A greener marketplace for a better tomorrow.',
            'footer_quick_links_title' => 'Quick Links',
            'footer_care_title' => 'Customer Care',
            'footer_about_title' => 'About our marketplace',
            'footer_install_title' => 'Install BSAB-SHOP',
            'footer_install_text' => 'Add our app to your device for quick access.',
            'footer_install_button' => 'Install app',
            'footer_newsletter_title' => 'Stay in the loop',
            'footer_newsletter_text' => 'Get the latest deals and updates.',
            'newsletter_placeholder' => 'Enter your email address',
            'shipping_options' => [
                'local_delivery' => true,
                'seller_delivery' => true,
                'pickup' => true,
            ],
            'shipping_steps' => [
                ['title' => 'Customer places order', 'description' => 'Choose products from local sellers and submit your order.'],
                ['title' => 'Seller confirms order', 'description' => 'The seller reviews the order and confirms availability.'],
                ['title' => 'Seller prepares products', 'description' => 'Your items are prepared for delivery or pickup.'],
                ['title' => 'Delivery is scheduled', 'description' => 'The seller or delivery team coordinates a suitable time.'],
                ['title' => 'Customer receives order', 'description' => 'Receive the order at your address or collect it from the seller.'],
            ],
            'footer_links' => [
                'quick_links' => [
                    ['label' => 'Home', 'href' => '/'],
                    ['label' => 'Products', 'href' => '/customer/products'],
                    ['label' => 'Orders', 'href' => '/customer/orders'],
                    ['label' => 'Favorites', 'href' => '/customer/favorites'],
                ],
                'customer_care' => [
                    ['label' => 'Help Center', 'href' => '/pages/help-center'],
                    ['label' => 'Shipping Info', 'href' => '/pages/shipping-info'],
                    ['label' => 'Return Policy', 'href' => '/pages/return-policy'],
                    ['label' => 'Contact Us', 'href' => '/pages/contact-us'],
                ],
                'about' => [
                    ['label' => 'Our Story', 'href' => '/pages/our-story'],
                    ['label' => 'Sustainability', 'href' => '/pages/sustainability'],
                    ['label' => 'Terms & Conditions', 'href' => '/pages/terms-conditions'],
                    ['label' => 'Privacy Policy', 'href' => '/pages/privacy-policy'],
                    ['label' => 'Team Developers', 'href' => '/pages/web-dev'],
                ],
            ],
            'footer_pages' => [
                ['title' => 'Help Center', 'slug' => 'help-center', 'content' => 'Find help with your account, orders, and shopping experience.'],
                [
                    'title' => 'Shipping Information',
                    'slug' => 'shipping-info',
                    'content' => 'BSAB-Shop currently provides local delivery services exclusively within Hinoba-an, Negros Occidental. We connect local customers with agricultural products, supplies, tools, and other products available from participating local sellers.',
                ],
                ['title' => 'Return Policy', 'slug' => 'return-policy', 'content' => 'Return eligibility and timelines may vary by product and seller. Review the terms provided with your order or contact customer support for assistance.'],
                [
                    'title' => 'Contact Us',
                    'slug' => 'contact-us',
                    'content' => 'We’re here to help! Whether you have a question, need assistance, or want to share feedback, our team is ready to support you. Get in touch with us and we’ll respond as soon as possible.',
                    'contact_details' => [
                        'email' => 'support@bsab-shop.com',
                        'phone' => '+63 912 345 6789',
                        'address' => 'Hinobaan, Negros Occidental, Philippines',
                        'support_hours' => 'Monday–Saturday, 8:00 AM–5:00 PM (Philippine Standard Time)',
                        'response_time' => '24 hours',
                    ],
                    'content_sections' => [
                        ['title' => 'Contact Methods', 'content' => 'Choose the best way to reach us. We’re available during our support hours and will get back to you as soon as possible.'],
                        ['title' => 'Send Us a Message', 'content' => 'Fill out the form below and we’ll get back to you as soon as possible.'],
                        ['title' => 'Quick Help & FAQ', 'content' => 'Find answers to common questions and get quick help with your concerns.'],
                        ['title' => 'Our Support Hours', 'content' => 'Monday–Saturday, 8:00 AM–5:00 PM (Philippine Standard Time). Response time: 24 hours.'],
                        ['title' => 'Additional Ways to Reach Us', 'content' => 'Connect with BSAB-Shop through our social and community channels.'],
                        ['title' => 'Before You Contact Us', 'content' => 'Have your order information and any supporting details ready so we can help you faster.'],
                    ],
                ],
                [
                    'title' => 'Our Story',
                    'slug' => 'our-story',
                    'content' => 'BSAB-Shop is a local e-commerce platform built to support our farmers, local sellers, and community by making agricultural products, supplies, tools, and more accessible to everyone in Hinoba-an, Negros Occidental.',
                    'content_sections' => [
                        ['title' => 'How It Started', 'content' => 'BSAB-Shop began with a simple idea: to create a convenient and reliable way for our local farmers and sellers to reach more customers. We saw the potential of e-commerce to connect our community, support local businesses, and promote sustainable agriculture in Hinoba-an.'],
                        ['title' => 'What We Do', 'content' => 'We provide a platform for local sellers to showcase and sell agricultural products, supplies, tools, equipment, and other essential items. Through BSAB-Shop, customers can browse, compare, and purchase quality products while directly supporting our local economy.'],
                        ['title' => 'Our Mission', 'content' => 'To empower local farmers, sellers, and the community by providing a trusted and accessible online marketplace for agricultural and everyday products in Hinoba-an, Negros Occidental.'],
                        ['title' => 'Our Vision', 'content' => 'A stronger, more connected local agriculture community where farmers and sellers can thrive.'],
                        ['title' => 'Our Values', 'content' => 'Community, integrity, sustainability, collaboration, and excellence guide our work.'],
                        ['title' => 'Our Journey', 'content' => 'From a simple idea to a growing platform, BSAB-Shop grows together with local sellers and customers.'],
                    ],
                ],
                [
                    'title' => 'Sustainability',
                    'slug' => 'sustainability',
                    'content' => 'At BSAB-Shop, we believe in building a greener, healthier and more sustainable future. We support local farmers, promote responsible consumption, and work together with our community to protect the environment for generations to come.',
                    'content_sections' => [
                        ['title' => 'Our Commitment', 'content' => 'We are committed to sustainable practices that support local farmers, protect the environment, and create long-term value for our community.'],
                        ['title' => 'Supporting Local Agriculture', 'content' => 'We provide a platform for local farmers and sellers to reach more customers, grow their businesses, and keep local agriculture strong and sustainable.'],
                        ['title' => 'Environmentally Friendly Practices', 'content' => 'We encourage responsible and eco-friendly practices across our operations and product offerings.'],
                        ['title' => 'Sustainable Product Choices', 'content' => 'We offer a variety of agricultural products, supplies, and tools that help farmers and communities grow responsibly.'],
                        ['title' => 'Our Impact', 'content' => 'Together, we create positive change for farmers, communities, and the environment.'],
                        ['title' => 'What You Can Do', 'content' => 'Every purchase and action makes a difference. You can help support sustainability by buying local, choosing eco-friendly products, and reducing, reusing, and recycling.'],
                        ['title' => 'Our Green Initiatives', 'content' => 'We support tree planting, waste reduction and recycling, energy-efficient operations, and community partnerships.'],
                        ['title' => 'Join Us in Growing a Greener Future', 'content' => 'Together, we can build a healthier and more sustainable future for our community and planet.'],
                    ],
                ],
                ['title' => 'Terms & Conditions', 'slug' => 'terms-conditions', 'content' => 'Please review the terms and conditions that apply to your use of BSABShop.'],
                ['title' => 'Privacy Policy', 'slug' => 'privacy-policy', 'content' => 'Please review the privacy policy to learn how information is handled when you use BSABShop.'],
                [
                    'title' => 'Team Developers',
                    'slug' => 'web-dev',
                    'content' => 'Meet the team behind BSAB-Shop — a dedicated group working together to build a reliable, user-friendly, and community-focused agricultural marketplace.',
                    'team_members' => [
                        ['name' => 'John Ray Boquina', 'role' => 'Adviser', 'description' => 'Provides guidance, direction, and professional advice throughout the development of the BSAB-Shop system.'],
                        ['name' => 'Kier Steve Narra', 'role' => 'Co-Adviser', 'description' => 'Supports the project through technical guidance, evaluation, and development recommendations.'],
                        ['name' => 'Joshua Macahipay', 'role' => 'Team Leader', 'description' => 'Leads the development team, coordinates project activities, manages implementation, and ensures the system meets its objectives.'],
                        ['name' => 'Rene Mendoza', 'role' => 'UI/UX Designer', 'description' => 'Designs the user interface and user experience, focusing on usability, accessibility, responsive layouts, and a consistent BSAB-Shop visual identity.'],
                        ['name' => 'Maridel Celestial', 'role' => 'Documentitor', 'description' => 'Manages project documentation, organizes system information, and ensures important development records are complete and properly maintained.'],
                    ],
                ],
                [
                    'title' => 'Return Policy',
                    'slug' => 'return-policy',
                    'content' => 'BSAB-Shop aims to provide a simple and transparent process for customers who receive damaged, defective, incorrect, incomplete, or otherwise eligible products from participating local sellers in Hinoba-an, Negros Occidental.',
                    'content_sections' => [
                        ['title' => 'Return Policy Overview', 'content' => 'Customers may request a return when an order qualifies under the BSAB-Shop return policy and applicable seller conditions.', 'items' => ['Product condition', 'Product category', 'Reason for return', 'Evidence provided by the customer', 'Seller’s return rules', 'Time limit configured by the administrator']],
                        ['title' => 'Eligible Return Reasons', 'content' => 'Administrators can enable or disable specific return reasons based on products, sellers, and business rules.', 'items' => ['Damaged product', 'Defective product', 'Incorrect product received', 'Missing item', 'Incomplete order', 'Wrong size or variation', 'Product does not match the order']],
                        ['title' => 'Return Time Limit', 'content' => 'The return request period is configured by the administrator and may vary.', 'items' => ['Return request period', 'Whether the period begins from order date or delivery date', 'Whether late requests are automatically rejected', 'Whether individual products can have different return periods']],
                        ['title' => 'Products That May Not Be Returnable', 'content' => 'Return eligibility is configurable according to the existing product system; not all listed categories are automatically non-returnable.', 'items' => ['Seeds', 'Plants', 'Fertilizers', 'Opened agricultural supplies', 'Used agricultural tools', 'Custom-made products', 'Perishable products', 'Products damaged through customer misuse', 'Products specifically marked as non-returnable by the seller']],
                        ['title' => 'Product Condition Requirements', 'content' => 'Returned products should generally be unused when required, in acceptable condition, complete with included accessories, and accompanied by required documentation or evidence.', 'items' => ['Unused when required, in the original packaging', 'In acceptable condition', 'Complete with included accessories', 'Returned with original packaging when applicable', 'Accompanied by the required documentation or evidence']],
                        ['title' => 'Return Request Process', 'content' => 'Clear evidence can help the seller evaluate your return request.', 'items' => ['Photos of the product', 'Photos of the packaging', 'Videos showing the problem', 'Order number', 'Product information', 'Description of the issue', 'Other supporting evidence requested by the seller']],
                        ['title' => 'How to Submit a Return Request', 'content' => 'Select an eligible product, choose a return reason, describe the problem, upload evidence when required, submit the request, and wait for review.', 'items' => ['Select the product that needs to be returned.', 'Choose the return reason.', 'Provide a description of the problem.', 'Upload photos or videos when required.', 'Submit the return request.', 'Wait for seller or BSAB-Shop review.']],
                        ['title' => 'Required Evidence', 'content' => 'Photos of the product and packaging, videos showing the problem, order and product information, and a description of the issue may be requested.', 'items' => ['Photos of the product', 'Photos of the packaging', 'Videos showing the problem', 'Order number', 'Product information', 'Description of the issue', 'Other supporting evidence requested by the seller']],
                        ['title' => 'Return Approval', 'content' => 'Return requests proceed through submitted, under review, approved or rejected, return processing, and completed statuses.', 'items' => ['Submitted', 'Under Review', 'Approved / Rejected', 'Return Processing', 'Completed']],
                        ['title' => 'Return Shipping / Delivery', 'content' => 'Return delivery arrangements depend on the reason for return and the seller’s policy.', 'items' => ['Customer returns to seller', 'Seller arranges collection', 'BSAB-Shop/local personnel handles collection when available', 'Customer coordinates with seller']],
                        ['title' => 'Return Resolutions', 'content' => 'Available resolutions may depend on the product, seller policy, return reason, and administrator configuration.', 'items' => ['Refund', 'Replacement', 'Exchange', 'Store credit', 'Other']],
                    ],
                ],
                [
                    'title' => 'Privacy Policy',
                    'slug' => 'privacy-policy',
                    'content' => 'This Privacy Policy explains how BSAB-Shop collects, uses, protects, and handles your personal information.',
                    'content_sections' => [
                        ['title' => 'Information We Collect', 'content' => 'We collect personal information you provide to us, such as your name, email address, phone number, shipping address, and payment information. We also collect information about your activity on our website and app, including browsing behavior and preferences.'],
                        ['title' => 'How We Use Your Information', 'content' => 'We use your information to process orders, provide customer support, improve our services, personalize your experience, send promotional offers (with your consent), and ensure the security and integrity of our platform.'],
                        ['title' => 'Account and Personal Data', 'content' => 'You can create an account with BSAB-Shop to access certain features. We are responsible for protecting the personal data in your account and you are responsible for keeping your login credentials secure. Please notify us immediately if you suspect any unauthorized access.'],
                        ['title' => 'Orders and Payments', 'content' => 'We collect and store information necessary to fulfill your orders and process payments, including billing and delivery details. Your payment information is securely handled by our trusted payment partners and is not stored on our servers.'],
                        ['title' => 'Cookies and Tracking', 'content' => 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand your preferences. You can manage your cookie settings through your browser, but disabling cookies may affect some features of our website.'],
                        ['title' => 'Data Sharing and Disclosure', 'content' => 'We do not sell your personal information. We may share your data with trusted service providers, business partners, and legal authorities when required by law, to protect our rights, or to fulfill your orders and provide our services.'],
                        ['title' => 'Data Security', 'content' => 'We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.'],
                        ['title' => 'Data Retention', 'content' => 'We keep your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, or as required by law. Once your information is no longer needed, we will securely delete or anonymize it.'],
                        ['title' => 'Your Privacy Rights', 'content' => 'You have the right to access, update, or correct your personal information. You may also request the deletion of your data, withdraw consent (when applicable), or object to certain uses of your information. To exercise your rights, please contact us through our support channels.'],
                        ['title' => 'Changes to This Privacy Policy', 'content' => 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any updates will be posted on this page with a revised effective date. We encourage you to review this policy periodically.'],
                    ],
                ],
                [
                    'title' => 'Terms & Conditions',
                    'slug' => 'terms-conditions',
                    'content' => 'Please read these Terms & Conditions carefully before using our services. By accessing or using BSAB-Shop, you agree to be bound by these terms.',
                    'content_sections' => [
                        ['title' => 'Acceptance of Terms', 'content' => 'By accessing, browsing, or purchasing from BSAB-Shop, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.'],
                        ['title' => 'Products and Services', 'content' => 'BSAB-Shop offers local agricultural products, local goods, and related services. We strive to ensure accurate product descriptions and availability, but we do not guarantee that all information is error-free. We reserve the right to modify or discontinue any product or service at any time without prior notice.'],
                        ['title' => 'Orders and Payments', 'content' => 'All orders are subject to confirmation and availability. Payment must be made through the approved methods provided on our website. We reserve the right to cancel or refuse any order if there are issues with payment, fraud, or product availability.'],
                        ['title' => 'Shipping and Delivery', 'content' => 'We will make every effort to deliver your order on time. Delivery times may vary depending on your location and the availability of products. BSAB-Shop is not responsible for delays caused by third-party logistics, weather conditions, or other unforeseen events.'],
                        ['title' => 'Returns and Refunds', 'content' => 'If you receive a damaged, defective, or incorrect product, please contact us within 7 days of receiving your order. We will review your request and provide a replacement or refund, subject to our return policy. Certain items may not be eligible for return or refund.'],
                        ['title' => 'User Responsibilities', 'content' => 'You agree to use our website and services for lawful purposes only. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.'],
                        ['title' => 'Intellectual Property', 'content' => 'All content on BSAB-Shop, including logos, images, text, and product information, is the property of BSAB-Shop or its respective owners. You may not copy, distribute, or use any content without our prior written permission.'],
                        ['title' => 'Limitation of Liability', 'content' => 'BSAB-Shop is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability, if any, will be limited to the amount paid for the product or service in question.'],
                        ['title' => 'Changes to Terms', 'content' => 'We reserve the right to update or modify these Terms & Conditions at any time. Changes will be posted on this page with the updated effective date. Your continued use of our services constitutes acceptance of the revised terms.'],
                        ['title' => 'Governing Law', 'content' => 'These Terms & Conditions are governed by the laws of the Philippines. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the relevant courts in the Philippines.'],
                    ],
                ],
            ],
        ];

        $defaults['footer_pages'] = collect($defaults['footer_pages'])
            ->keyBy('slug')
            ->values()
            ->all();

        return $defaults;
    }

    public static function homeSettings(): array
    {
        $settings = self::query()->pluck('value', 'key')->all();

        foreach (['logo_path', 'login_background_path', 'hero_media_path'] as $key) {
            if (! empty($settings[$key]) && ! self::isExternalPath($settings[$key]) && ! Storage::disk('public')->exists($settings[$key])) {
                $settings[$key] = null;
            }
        }

        if (empty($settings['hero_media_path'])) {
            $settings['hero_media_type'] = null;
        }

        foreach (['footer_links', 'footer_pages', 'shipping_options', 'shipping_steps'] as $key) {
            if (isset($settings[$key]) && is_string($settings[$key])) {
                $decoded = json_decode($settings[$key], true);
                $settings[$key] = is_array($decoded) ? $decoded : self::defaults()[$key];
            }
        }

        return array_merge(self::defaults(), array_intersect_key($settings, self::defaults()));
    }

    public static function mediaStorageStatus(): array
    {
        $keys = ['logo_path', 'login_background_path', 'hero_media_path'];

        return collect($keys)->mapWithKeys(function (string $key) {
            $value = self::query()->where('key', $key)->value('value');

            return [
                $key => [
                    'key' => $key,
                    'value' => $value,
                    'inDatabase' => $value !== null && $value !== '',
                    'existsOnDisk' => $value !== null && $value !== '' && (self::isExternalPath($value) || Storage::disk('public')->exists($value)),
                ],
            ];
        })->all();
    }

    public static function isExternalPath(string $path): bool
    {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/');
    }
}
