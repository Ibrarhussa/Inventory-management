<?php

use App\Http\Controllers\CashDrawController;
use App\Http\Controllers\GeneratedCodeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'OK',
    'timestamp' => now()->toISOString(),
]));

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/stats/inventory', [ProductController::class, 'inventoryStats']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::post('/{id}', [ProductController::class, 'update']);
    Route::put('/{id}', [ProductController::class, 'update']);
    Route::delete('/{id}', [ProductController::class, 'destroy']);
});

Route::prefix('cashdraw')->group(function () {
    Route::get('/', [CashDrawController::class, 'show']);
    Route::get('/history', [CashDrawController::class, 'history']);
    Route::post('/add-item', [CashDrawController::class, 'addItem']);
    Route::post('/update-item', [CashDrawController::class, 'updateItem']);
    Route::post('/remove-item', [CashDrawController::class, 'removeItem']);
    Route::delete('/clear', [CashDrawController::class, 'clear']);
});

Route::prefix('sales')->group(function () {
    Route::get('/summary', [SalesController::class, 'summary']);
    Route::get('/by-period', [SalesController::class, 'byPeriod']);
    Route::post('/sync-from-cashdraw', [SalesController::class, 'syncFromCashDraw']);
    Route::get('/best-sellers', [SalesController::class, 'bestSellers']);
    Route::get('/stats', [SalesController::class, 'stats']);
    Route::post('/', [SalesController::class, 'store']);
    Route::delete('/{id}', [SalesController::class, 'destroy']);
});

Route::prefix('barcodes')->group(function () {
    Route::get('/', [GeneratedCodeController::class, 'listBarcodes']);
    Route::get('/lookup', [GeneratedCodeController::class, 'lookupBarcode']);
    Route::post('/', [GeneratedCodeController::class, 'storeBarcode']);
    Route::delete('/{id}', [GeneratedCodeController::class, 'destroyBarcode']);
});

Route::prefix('qrcodes')->group(function () {
    Route::get('/', [GeneratedCodeController::class, 'listQRCodes']);
    Route::post('/bulk', [GeneratedCodeController::class, 'storeQRCodes']);
    Route::delete('/{id}', [GeneratedCodeController::class, 'destroyQRCode']);
});
