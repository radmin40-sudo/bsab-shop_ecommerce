import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

export async function prepareSanctum(): Promise<void> {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

export async function currentUser() {
    const response = await api.get('/user');
    return response.data;
}

export async function listProducts(params?: { search?: string; category?: string; page?: number }) {
    const response = await api.get('/products', { params });
    return response.data;
}

export async function getCart() {
    const response = await api.get('/customer/cart');
    return response.data;
}

export function getApiErrorMessage(error: unknown, fallback = 'This product is currently unavailable.') {
    const payload = error as {
        response?: {
            data?: {
                message?: string;
            };
        };
        message?: string;
    };

    return payload?.response?.data?.message ?? payload?.message ?? fallback;
}

export async function addCartItem(payload: { product_id: number; variant_id?: number; quantity: number }) {
    await prepareSanctum();
    const response = await api.post('/customer/cart/items', payload);
    return response.data;
}

export async function updateCartItem(itemId: number, quantity: number) {
    await prepareSanctum();
    const response = await api.patch(`/customer/cart/items/${itemId}`, { quantity });
    return response.data;
}

export async function removeCartItem(itemId: number) {
    await prepareSanctum();
    await api.delete(`/customer/cart/items/${itemId}`);
}

export async function checkoutCart(payload: { shipping_address: Record<string, string>; payment_method: string; voucher_code?: string }) {
    await prepareSanctum();
    const response = await api.post('/customer/checkout', payload);
    return response.data;
}

export async function validateVoucher(code: string, subtotal: number) {
    await prepareSanctum();
    const response = await api.post('/customer/voucher/validate', { code, subtotal });
    return response.data as { code: string; discount: number };
}
