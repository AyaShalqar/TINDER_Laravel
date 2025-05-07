<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Junges\Kafka\Facades\Kafka; 
use Illuminate\Support\Facades\Log; 

class SwipeController extends Controller
{
    public function store(Request $request)
    {
        // 1. Получаем и валидируем данные о свайпе
        $validatedData = $request->validate([
            'swiped_user_id' => 'required|integer|exists:users,id',
            'action' => 'required|string|in:like,pass',
        ]);

        $swiperUserId = Auth::id(); 
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
            'timestamp'      => now()->toISOString(),
        ];

       // 3. Отправляем сообщение в Kafka
       try {
        // Сначала создаем "строителя" без аргументов
        $producerBuilder = Kafka::publish()
             ->onTopic('user_swipes')         
             ->withBody($messagePayload)      
             ->withKafkaKey((string)$swiperUserId); 

        // Отправляем настроенное сообщение
        $producerBuilder->send();

        Log::info('Swipe message sent to Kafka', $messagePayload); 

    } catch (\Exception $e) {
        Log::error('Failed to send swipe message to Kafka: ' . $e->getMessage(), $messagePayload);
        // Возвращаем ошибку, если не удалось отправить в Kafka
        return response()->json(['message' => 'Failed to process swipe, please try again later.'], 500);
    }

        // 4. Отвечаем пользователю БЫСТРО
        return response()->json(['message' => 'Swipe received'], 202); 
    }
}