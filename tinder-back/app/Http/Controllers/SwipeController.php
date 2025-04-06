<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Для получения ID текущего пользователя
use Junges\Kafka\Facades\Kafka; // Используем правильный use для фасада
use Illuminate\Support\Facades\Log; // Для логирования ошибок

// Назовите класс контроллера как вам удобно, например SwipeController
class SwipeController extends Controller
{
    /**
     * Обработка свайпа пользователя.
     * POST /swipes
     */
    public function store(Request $request)
    {
        // 1. Получаем и валидируем данные о свайпе
        $validatedData = $request->validate([
            'swiped_user_id' => 'required|integer|exists:users,id',
            'action' => 'required|string|in:like,pass',
        ]);

        $swiperUserId = Auth::id(); // ID того, кто свайпает
        $swipedUserId = $validatedData['swiped_user_id'];
        $action = $validatedData['action'];

        // Опционально: Проверка, чтобы не свайпали сами себя
        if ($swiperUserId == $swipedUserId) {
            return response()->json(['message' => 'Cannot swipe yourself'], 400);
        }

        // 2. Формируем сообщение для Kafka
        $messagePayload = [
            'swiper_user_id' => $swiperUserId,
            'swiped_user_id' => $swipedUserId,
            'action'         => $action,
            'timestamp'      => now()->toISOString(), // Время свайпа в UTC
        ];

       // 3. Отправляем сообщение в Kafka
       try {
        // Сначала создаем "строителя" без аргументов
        $producerBuilder = Kafka::publish()
             ->onTopic('user_swipes')           // Указываем топик через ->onTopic()
             ->withBody($messagePayload)       // Передаем тело сообщения (массив)
             ->withKafkaKey((string)$swiperUserId); // Указываем ключ

        // Отправляем настроенное сообщение
        $producerBuilder->send();

        Log::info('Swipe message sent to Kafka', $messagePayload); // Логируем успех

    } catch (\Exception $e) {
        Log::error('Failed to send swipe message to Kafka: ' . $e->getMessage(), $messagePayload);
        // Возвращаем ошибку, если не удалось отправить в Kafka
        return response()->json(['message' => 'Failed to process swipe, please try again later.'], 500);
    }

        // 4. Отвечаем пользователю БЫСТРО
        return response()->json(['message' => 'Swipe received'], 202); // 202 Accepted
    }
}