<?php

namespace app\API\v0_0_1\skillers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\VerbFilter;
use app\models\ProfessionalAvailability;
use app\models\Users;
use app\models\ProfessionUser;
use app\models\Utils;

class AvailabilityController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        return [
            'corsFilter' => [
                'class' => \yii\filters\Cors::className(),
                'cors' => [
                    'Origin' => ['*'],
                    'Access-Control-Request-Method' => ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'],
                    'Access-Control-Request-Headers' => ['*'],
                    'Access-Control-Allow-Credentials' => null,
                    'Access-Control-Max-Age' => 86400,
                ],
            ],
            'contentNegotiator' => [
                'class' => \yii\filters\ContentNegotiator::class,
                'formats' => [
                    'application/json' => Response::FORMAT_JSON,
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'set-availability' => ['POST'],
                    'get-my-availability' => ['GET'],
                    'delete-availability' => ['DELETE'],
                    'update-availability' => ['PUT', 'PATCH'],
                    'get-availability' => ['GET'],
                    'toggle-availability' => ['POST'],
                    'check-professional-status' => ['GET'],
                ],
            ],
        ];
    }

    // ------------------------ AUTHENTICATION METHOD ------------------------

    private function getUserIdFromToken()
    {
        $authHeader = Yii::$app->request->headers->get('Authorization');
        
        if (!$authHeader) {
            Yii::error("No Authorization header found");
            return null;
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
        } else {
            $token = trim($authHeader);
        }

        if (empty($token)) {
            Yii::error("Empty token extracted from header");
            return null;
        }

        $user = Users::find()
            ->where(['token' => $token, 'is_activated' => 1])
            ->one();

        if (!$user) {
            Yii::error("No active user found with provided token");
            return null;
        }

        return (string)$user->id;
    }

    private function validateAuth()
    {
        $user_id = $this->getUserIdFromToken();
        $language_code = Yii::$app->request->headers->get('Language','en');

        if (!$user_id) {
            Yii::$app->response->statusCode = 401;
            return [
                'success' => false,
                'message' => Utils::findString('Authentication failed. Please check your token.', $language_code),
                'debug_info' => [
                    'auth_user' => null,
                    'getUserIdFromToken_result' => null,
                    'has_authorization_header' => !empty(Yii::$app->request->headers->get('Authorization'))
                ]
            ];
        }

        return $user_id;
    }

    // ------------------------ PROFESSIONAL USER VALIDATION ------------------------

    private function isProfessionalUser($user_id)
    {
        return ProfessionUser::find()
            ->where(['user_id' => $user_id])
            ->exists();
    }

    private function validateProfessionalUser($user_id, $language_code = 'en')
    {
        if (!$this->isProfessionalUser($user_id)) {
            Yii::$app->response->statusCode = 403;
            return [
                'success' => false,
                'message' => Utils::findString('Access denied. Only professional users can manage availability.', $language_code),
                'error_code' => 'NOT_PROFESSIONAL'
            ];
        }
        return true;
    }

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }

    // ------------------------ CHECK PROFESSIONAL STATUS ------------------------

    public function actionCheckProfessionalStatus()
    {
        $authResult = $this->validateAuth();
        if (!is_string($authResult)) {
            return $authResult;
        }
        $user_id = $authResult;
        $language_code = Yii::$app->request->headers->get('Language','en');

        $isProfessional = $this->isProfessionalUser($user_id);
        
        // Get profession details if professional
        $professions = [];
        if ($isProfessional) {
            $professions = ProfessionUser::find()
                ->where(['user_id' => $user_id])
                ->select(['profession_id', 'is_primary', 'experience_years', 'is_verified'])
                ->asArray()
                ->all();
        }

        return [
            'success' => true,
            'data' => [
                'user_id' => $user_id,
                'is_professional' => $isProfessional,
                'professions' => $professions,
                'can_manage_availability' => $isProfessional
            ]
        ];
    }

    // ------------------------ SET AVAILABILITY (PROFESSIONAL ONLY) ------------------------
public function actionSetAvailability()
{
    $authResult = $this->validateAuth();
    if (!is_string($authResult)) {
        return $authResult;
    }
    $user_id = $authResult;
    $language_code = Yii::$app->request->headers->get('Language','en');

    // Check if user is professional
    $professionalCheck = $this->validateProfessionalUser($user_id, $language_code);
    if ($professionalCheck !== true) {
        return $professionalCheck;
    }

    $postData = json_decode(Yii::$app->request->getRawBody(), true);
    $availability_slots = $postData['availability_slots'] ?? [];

    if (empty($availability_slots)) {
        Yii::$app->response->statusCode = 400;
        return [
            'success' => false,
            'message' => Utils::findString('Please provide availability slots', $language_code)
        ];
    }

    $validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    foreach ($availability_slots as $i => $slot) {
        if (empty($slot['day_of_week']) || empty($slot['start_time']) || empty($slot['end_time'])) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString("Invalid slot at index {$i}: day_of_week, start_time, and end_time are required", $language_code)
            ];
        }

        if (!in_array(strtolower($slot['day_of_week']), $validDays)) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString("Invalid day_of_week at index {$i}. Must be one of: " . implode(', ', $validDays), $language_code)
            ];
        }

        if (!preg_match('/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/', $slot['start_time']) || 
            !preg_match('/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/', $slot['end_time'])) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString("Invalid time format at index {$i}. Use HH:MM format (e.g., 09:00, 14:30)", $language_code)
            ];
        }

        if (strtotime($slot['start_time']) >= strtotime($slot['end_time'])) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString("Invalid time range at index {$i}: end_time must be after start_time", $language_code)
            ];
        }
    }

    $transaction = Yii::$app->db->beginTransaction();
    try {
        // Delete existing availability
        Yii::$app->db->createCommand()
            ->delete('professional_availability', ['user_id' => $user_id])
            ->execute();

        $savedSlots = [];
        foreach ($availability_slots as $slot) {
            $result = Yii::$app->db->createCommand()
                ->insert('professional_availability', [
                    'user_id' => $user_id,
                    'day_of_week' => strtolower($slot['day_of_week']),
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'slot_duration' => $slot['slot_duration'] ?? 60,
                    'max_appointments_per_slot' => $slot['max_appointments_per_slot'] ?? 1,
                    'is_active' => $slot['is_active'] ?? 1,
                    'created_at' => new \yii\db\Expression('NOW()'),
                    'updated_at' => new \yii\db\Expression('NOW()'),
                ])->execute();

            if (!$result) {
                throw new \Exception('Failed to save slot');
            }

            $lastId = Yii::$app->db->getLastInsertID();
            
            $savedSlots[] = [
                'id' => $lastId,
                'day_of_week' => strtolower($slot['day_of_week']),
                'start_time' => $slot['start_time'],
                'end_time' => $slot['end_time'],
                'slot_duration' => $slot['slot_duration'] ?? 60,
                'max_appointments_per_slot' => $slot['max_appointments_per_slot'] ?? 1,
                'is_active' => $slot['is_active'] ?? 1
            ];
        }

        $transaction->commit();

        Yii::$app->response->statusCode = 200;
        return [
            'success' => true,
            'message' => Utils::findString('Availability set successfully', $language_code),
            'data' => [
                'slots_count' => count($savedSlots),
                'user_id' => $user_id,
                'slots' => $savedSlots
            ]
        ];

    } catch (\Exception $e) {
        $transaction->rollBack();
        Yii::$app->response->statusCode = 500;
        return [
            'success' => false,
            'message' => Utils::findString('Failed to set availability', $language_code),
            'error' => $e->getMessage()
        ];
    }
}

    // ------------------------ GET MY AVAILABILITY (PROFESSIONAL ONLY) ------------------------

public function actionGetMyAvailability()
{
    $authResult = $this->validateAuth();
    if (!is_string($authResult)) {
        return $authResult;
    }
    $user_id = $authResult;
    $language_code = Yii::$app->request->headers->get('Language','en');

    // Check if user is professional
    $professionalCheck = $this->validateProfessionalUser($user_id, $language_code);
    if ($professionalCheck !== true) {
        return $professionalCheck;
    }

    try {
        // Use raw SQL query to avoid FIELD() function issues with Yii2
        $sql = "
            SELECT * 
            FROM professional_availability 
            WHERE user_id = :user_id AND is_active = 1 
            ORDER BY 
                FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
                start_time
        ";
        
        $availability = Yii::$app->db->createCommand($sql)
            ->bindValue(':user_id', $user_id)
            ->queryAll();

        return [
            'success' => true,
            'data' => [
                'user_id' => $user_id,
                'availability_slots' => $availability,
                'total_slots' => count($availability)
            ]
        ];

    } catch (\Exception $e) {
        Yii::$app->response->statusCode = 500;
        return [
            'success' => false,
            'message' => Utils::findString('Failed to retrieve availability', $language_code),
            'error' => $e->getMessage()
        ];
    }
}

    // ------------------------ UPDATE AVAILABILITY (PROFESSIONAL ONLY) ------------------------

    public function actionUpdateAvailability()
    {
        $authResult = $this->validateAuth();
        if (!is_string($authResult)) {
            return $authResult;
        }
        $user_id = $authResult;
        $language_code = Yii::$app->request->headers->get('Language','en');

        // Check if user is professional
        $professionalCheck = $this->validateProfessionalUser($user_id, $language_code);
        if ($professionalCheck !== true) {
            return $professionalCheck;
        }

        $postData = json_decode(Yii::$app->request->getRawBody(), true);
        $availability_id = $postData['availability_id'] ?? null;
        $update_data = $postData['update_data'] ?? [];

        if (!$availability_id || empty($update_data)) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString('availability_id and update_data are required', $language_code)
            ];
        }

        try {
            $result = Yii::$app->db->createCommand()
                ->update('professional_availability', $update_data, [
                    'id' => $availability_id,
                    'user_id' => $user_id // Ensure user owns this availability
                ])
                ->execute();

            if ($result > 0) {
                return [
                    'success' => true,
                    'message' => Utils::findString('Availability updated successfully', $language_code)
                ];
            } else {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => Utils::findString('Availability slot not found or access denied', $language_code)
                ];
            }

        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => Utils::findString('Failed to update availability', $language_code),
                'error' => $e->getMessage()
            ];
        }
    }

    // ------------------------ DELETE AVAILABILITY (PROFESSIONAL ONLY) ------------------------

    public function actionDeleteAvailability()
    {
        $authResult = $this->validateAuth();
        if (!is_string($authResult)) {
            return $authResult;
        }
        $user_id = $authResult;
        $language_code = Yii::$app->request->headers->get('Language','en');

        // Check if user is professional
        $professionalCheck = $this->validateProfessionalUser($user_id, $language_code);
        if ($professionalCheck !== true) {
            return $professionalCheck;
        }

        $availability_id = Yii::$app->request->get('availability_id');

        if (!$availability_id) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString('availability_id is required', $language_code)
            ];
        }

        try {
            $result = Yii::$app->db->createCommand()
                ->delete('professional_availability', [
                    'id' => $availability_id,
                    'user_id' => $user_id // Ensure user owns this availability
                ])
                ->execute();

            if ($result > 0) {
                return [
                    'success' => true,
                    'message' => Utils::findString('Availability deleted successfully', $language_code)
                ];
            } else {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => Utils::findString('Availability slot not found or access denied', $language_code)
                ];
            }

        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => Utils::findString('Failed to delete availability', $language_code),
                'error' => $e->getMessage()
            ];
        }
    }

    // ------------------------ TOGGLE AVAILABILITY (PROFESSIONAL ONLY) ------------------------

    public function actionToggleAvailability()
    {
        $authResult = $this->validateAuth();
        if (!is_string($authResult)) {
            return $authResult;
        }
        $user_id = $authResult;
        $language_code = Yii::$app->request->headers->get('Language','en');

        // Check if user is professional
        $professionalCheck = $this->validateProfessionalUser($user_id, $language_code);
        if ($professionalCheck !== true) {
            return $professionalCheck;
        }

        $postData = json_decode(Yii::$app->request->getRawBody(), true);
        $availability_id = $postData['availability_id'] ?? null;
        $is_active = $postData['is_active'] ?? null;

        if (!$availability_id || $is_active === null) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'message' => Utils::findString('availability_id and is_active are required', $language_code)
            ];
        }

        try {
            $result = Yii::$app->db->createCommand()
                ->update('professional_availability', [
                    'is_active' => $is_active ? 1 : 0,
                    'updated_at' => new \yii\db\Expression('NOW()')
                ], [
                    'id' => $availability_id,
                    'user_id' => $user_id
                ])
                ->execute();

            if ($result > 0) {
                $status = $is_active ? 'enabled' : 'disabled';
                return [
                    'success' => true,
                    'message' => Utils::findString("Availability {$status} successfully", $language_code)
                ];
            } else {
                Yii::$app->response->statusCode = 404;
                return [
                    'success' => false,
                    'message' => Utils::findString('Availability slot not found or access denied', $language_code)
                ];
            }

        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'success' => false,
                'message' => Utils::findString('Failed to toggle availability', $language_code),
                'error' => $e->getMessage()
            ];
        }
    }

   

// ------------------------ GET AVAILABILITY (PROTECTED - AUTH REQUIRED) ------------------------

public function actionGetAvailability()
{
    $authResult = $this->validateAuth();
    if (!is_string($authResult)) {
        return $authResult;
    }
    
    $current_user_id = $authResult;
    $target_user_id = Yii::$app->request->get('user_id');
    $language_code = Yii::$app->request->headers->get('Language','en');

    // If no target user specified, use current user
    if (!$target_user_id) {
        $target_user_id = $current_user_id;
    }

    try {
        // Check if target user is professional
        $isProfessional = $this->isProfessionalUser($target_user_id);
        
        if (!$isProfessional) {
            return [
                'success' => true,
                'data' => [
                    'user_id' => $target_user_id,
                    'is_professional' => false,
                    'availability_slots' => [],
                    'message' => 'User is not a professional'
                ]
            ];
        }

        // Use raw SQL like the working get-my-availability method
        $sql = "
            SELECT * 
            FROM professional_availability 
            WHERE user_id = :user_id AND is_active = 1 
            ORDER BY 
                FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
                start_time
        ";
        
        $availability = Yii::$app->db->createCommand($sql)
            ->bindValue(':user_id', $target_user_id)
            ->queryAll();

        return [
            'success' => true,
            'data' => [
                'user_id' => $target_user_id,
                'is_professional' => true,
                'availability_slots' => $availability,
                'total_slots' => count($availability)
            ]
        ];

    } catch (\Exception $e) {
        Yii::$app->response->statusCode = 500;
        return [
            'success' => false,
            'message' => Utils::findString('Failed to retrieve availability', $language_code),
            'error' => $e->getMessage()
        ];
    }
}
}