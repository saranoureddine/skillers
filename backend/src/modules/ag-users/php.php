<?php

namespace app\API\v0_0_1\skillers;

use app\API\v0_0_1\skillers\GeneralController;
use Yii;
use Exception;
use yii\web\Response;
use yii\rest\Controller;
use yii\filters\Cors;
use yii\filters\ContentNegotiator;
use yii\data\Pagination;
use yii\db\Query;
use yii\db\Expression;
use yii\helpers\Json;
use app\models\AgUsers;
use app\models\AgUsersCities;
use app\models\AgUserStores;
use app\models\AgAttachment;
use app\models\AgSettings;
use app\models\AgDeletedRecords;
use app\models\AgLanguages;
use app\models\AgTablesSchema;
use app\models\Utils;
use app\models\StoreInvolvedUsers;
use app\models\SmsData;
use app\models\OwnerData;
use app\models\Cities;
use app\models\Province;


/* -------------------- constants -------------------- */

const BASE_HOST    = base_host;
const TABLE_USERS  = 1;   // ag_attachment.table_name for ag_users
const VIDEOS       = 2;   // attachment.type for video files

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
date_default_timezone_set('UTC');

class AgUsersController extends Controller
{
    /* ─────────── behaviours ─────────── */
    public function behaviors()
    {
        return [
            'cors' => [
                'class' => Cors::class,
                'cors'  => [
                    'Origin'                        => ['*'],
                    'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                    'Access-Control-Allow-Headers'  => ['*'],
                ],
            ],
            'negotiator' => [
                'class'   => ContentNegotiator::class,
                'formats' => ['application/json' => Response::FORMAT_JSON],
            ],
        ];
    }
    public function actions()
    {
        return [];
    }



    /* ─────────── token helpers (same as suggestions) ─────────── */
    private function extractToken(): ?string
    {
        $header = Yii::$app->request->headers->get('Authorization');
        if ($header) {
            // strip optional “Bearer ” / “Token ” prefix
            return trim(preg_replace('/^(Bearer|Token)\s+/i', '', $header));
        }
        return Yii::$app->request->post('token')
            ?? Yii::$app->request->get('token')
            ?? null;
    }

    private function requireAuth($token)
    {
        // Validate User
        $validateUser = GeneralController::validateToken($token);
        if (! isset($validateUser['success']) || ! $validateUser['success']) {
            Yii::$app->response->statusCode = 401;
            $result = [
                'succeeded' => 'false',
                'message' => 'Unauthorized access'
            ];
            return $result;
        }

        $user_id = $validateUser['user']['user_id'];
        return $user_id;
    }

    /* ─────────── helper: fetch all user images ─────────── */
    private function fetchUserImages(string $userId): array
    {
        return (new Query())
            ->select([
                'id',
                'type',
                'is_video' =>
                new Expression('IF(type = ' . VIDEOS . ', TRUE, FALSE)'),
                'file_path' =>
                new Expression("
                        CASE
                            WHEN file_path LIKE 'http%' THEN file_path
                            ELSE CONCAT(:base, file_path)
                        END
                    "),
            ])
            ->from('ag_attachment')
            ->where(['table_name' => TABLE_USERS, 'row_id' => $userId])
            ->addParams([':base' => BASE_HOST])
            ->orderBy(['id' => SORT_ASC])
            ->all() ?: [];
    }
    public function actionGetLanguages()
    {
        try {
            $request       = Yii::$app->request;
            $language_code = $request->headers->get('Language', 'en');
            $token         = $request->headers->get('Authorization');
            if (!$token) {
                Yii::$app->response->statusCode = 401;
                return ['succeeded' => false, 'message' => 'Unauthorized access'];
            }
            $authId   = $this->requireAuth($token);
            if (!$authId) {
                return $authId;
            }
            $languages = AgLanguages::find()->select(['id', 'name', 'flag_code', 'shortcut', 'default_lang'])->all();
            return ['succeeded' => true, 'languages' => $languages];
        } catch (Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['succeeded' => false, 'message' => 'Failed to get languages', 'error' => YII_DEBUG ? $e->getMessage() : null];
        }
    }
    /* ─────────────────── CREATE USER ─────────────────── */
    /* ─────────────────── CREATE USER ─────────────────── */
    public function actionCreateUser()
    {
        $tx     = Yii::$app->db->beginTransaction();
        $request       = Yii::$app->request;
        $language_code = $request->headers->get('Language', 'en');
        $token         = $request->headers->get('Authorization');
        $authId   = $this->requireAuth($token);
        try {
            $post = Yii::$app->request->post();

            if (!is_string($authId)) {
                if ($authId['succeeded'] == "false") {
                    return $authId;
                }
            }

            foreach (['user_name', 'user_password', 'user_role'] as $f) {
                if (empty($post[$f])) {
                    Yii::$app->response->statusCode = 400;
                    return ['succeeded' => false, "message" => "Missing {$f}"];
                }
            }

            /* ────── 1. uniqueness guards ────── */
            if (
                !empty($post['email_address']) &&
                AgUsers::find()->where(['email_address' => trim($post['email_address'])])->exists()  // fast EXISTS() :contentReference[oaicite:0]{index=0}
            ) {
                Yii::$app->response->statusCode = 422;
                return ['succeeded' => false, 'message' => 'Email already exists'];
            }

            if (
                !empty($post['phone_number_one']) &&
                AgUsers::find()->where(['phone_number_one' => trim($post['phone_number_one'])])->exists()
            ) {
                Yii::$app->response->statusCode = 422;
                return ['succeeded' => false, 'message' => 'Phone number already exists'];
            }
            /* ────────────────────────────────── */

            $u                = new AgUsers();
            $u->load($post, '');
            $u->user_id       = GeneralController::generateId();
            $u->user_password = Yii::$app->security->generatePasswordHash($post['user_password']);
            $u->token         = GeneralController::generateToken();
            $u->country = $postData['country_code'] ?? null;
            $u->created_at    = date('Y-m-d H:i:s');
            $u->updated_at    = $u->created_at;
            $u->created_by    = $authId;
            $u->center_num    = 10;
            //  ?? AgSettings::findOne(1)->place_id;

            if (!$u->save()) {
                throw new \Exception(json_encode($u->errors));
            }

            /* ─── pivot tables ─── */
            $cities = !empty($post['cities']) ? (array)Json::decode($post['cities']) : [];
            foreach ($cities as $cid) {
                (new AgUsersCities(['user_id' => $u->user_id, 'city_id' => $cid]))->save();
            }

            // Handle both 'stores' and 'store_id' fields (both in array format)
            $stores = [];
            if (!empty($post['stores'])) {
                $stores = is_string($post['stores']) ? (array)Json::decode($post['stores']) : (array)$post['stores'];
            } elseif (!empty($post['store_id'])) {
                $stores = is_string($post['store_id']) ? (array)Json::decode($post['store_id']) : (array)$post['store_id'];
            }

            foreach ($stores as $sid) {
                if (!empty($sid)) {
                    (new AgUserStores(['user_id' => $u->user_id, 'store_id' => $sid]))->save();
                }
            }

            $tx->commit();
            return [
                'succeeded' => true,
                'data'    => array_merge($u->attributes, ['token' => $u->token]),
                'message' => 'User created successfully',
            ];
        } catch (\Throwable $e) {
            $tx->rollBack();
            Yii::$app->response->statusCode = 500;
            // return ['succeeded'=>false,'message'=>$e->getMessage()];
            return ['message' => 'Server error', 'error' => [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]];
        }
    }

    /* ─────────────────── GET ONE USER ─────────────────── */
    public function actionGetUser($id)
    {
        $request       = Yii::$app->request;
        $language_code = $request->headers->get('Language', 'en');
        $token         = $request->headers->get('Authorization');
        $user_id   = $this->requireAuth($token);

        try {
            $m = AgUsers::findOne($id);
            if (!$m) {
                Yii::$app->response->statusCode = 404;
                return ['succeeded' => false, 'message' => 'User not found'];
            }

            $user            = $m->attributes;
            $user['images']  = $this->fetchUserImages($m->user_id);
            $user['cities']  = (new Query())->select('city_id')
                ->from('ag_users_cities')
                ->where(['user_id' => $m->user_id])->column();
            $user['stores']  = (new Query())->select('store_id')
                ->from('ag_user_stores')
                ->where(['user_id' => $m->user_id])->column();

            return ['succeeded' => true, 'user' => $user];
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return ['succeeded' => false, 'message' => $e->getMessage()];
        }
    }

    /* ─────────────────── GET ALL USERS ─────────────────── */
    public function actionGetAllUsers()
    {
        $request = Yii::$app->request;
        $language_code = $request->headers->get('Language', 'en');
        $token = $request->headers->get('Authorization');
        $user_id = $this->requireAuth($token);

        try {
            // Check if user is admin
            $isAdmin = (new \yii\db\Query())
                ->select(['ag_user_groups.group_name'])
                ->from('ag_users')
                ->leftJoin('ag_user_groups', 'ag_users.user_role = ag_user_groups.id')
                ->where(['ag_users.user_id' => $user_id])
                ->andWhere(['ag_user_groups.group_name' => 'Admin'])
                ->exists();

            $adminCities = [];
            if (!$isAdmin) {
                // Get admin's cities from ag_users_cities if not admin
                $adminCities = (new \yii\db\Query())
                    ->select(['city_id'])
                    ->from('ag_users_cities')
                    ->where(['user_id' => $user_id])
                    ->column();
            }

            $search = $request->get('search');
            $cityIds = $request->get('city_ids'); // Can be a single value or array
            $role = $request->get('role'); // Role filter parameter

            // Process city_ids parameter
            if (!empty($cityIds)) {
                if (is_string($cityIds)) {
                    $decoded = json_decode($cityIds, true);
                    if (is_array($decoded)) {
                        $cityIds = $decoded;
                    } elseif (str_contains($cityIds, ',')) {
                        $cityIds = explode(',', $cityIds);
                    } else {
                        $cityIds = [(int)$cityIds];
                    }
                } elseif (!is_array($cityIds)) {
                    $cityIds = [(int)$cityIds];
                }
            }

            $q = AgUsers::find()->alias('u')
                ->select([
                    'u.*',
                    '(SELECT c.city_name FROM cities c INNER JOIN ag_users_cities auc ON auc.city_id = c.id WHERE auc.user_id = u.user_id LIMIT 1) AS city_name',
                    '(SELECT creator.user_name FROM ag_users creator WHERE creator.user_id = u.created_by) AS created_by_name',
                    '(SELECT updater.user_name FROM ag_users updater WHERE updater.user_id = u.updated_by) AS updated_by_name',
                    '(SELECT g.group_name FROM ag_user_groups g WHERE g.id = u.user_role) AS role_name',
                ])
                ->orderBy(new \yii\db\Expression('CAST(created_at AS DATETIME) DESC'));

            // Apply search filter
            if (!empty($search)) {
                $q->andFilterWhere([
                    'or',
                    ['like', 'user_name', $search],
                    ['like', 'first_name', $search],
                    ['like', 'last_name', $search],
                    ['like', 'user_id', $search],
                    ['like', 'phone_number_one', $search],
                    ['like', 'phone_number_two', $search],
                    ['like', 'email_address', $search],
                ]);
            }

            // Apply role filter
            if (!empty($role)) {
                $q->andWhere([
                    'exists',
                    (new \yii\db\Query())
                        ->select(new \yii\db\Expression('1'))
                        ->from('ag_user_groups g')
                        ->where('g.id = u.user_role')
                        ->andWhere(['g.group_name' => $role])
                ]);
            }

            // Apply city filtering
            if (!empty($cityIds)) {
                // If city_ids parameter is provided, use it
                $q->andWhere([
                    'exists',
                    (new \yii\db\Query())
                        ->select(new \yii\db\Expression('1'))
                        ->from('ag_users_cities auc')
                        ->where('auc.user_id = u.user_id')
                        ->andWhere(['in', 'auc.city_id', $cityIds])
                ]);
            } elseif (!$isAdmin) {
                // If not admin and no city_ids provided, filter by admin's cities
                if (!empty($adminCities)) {
                    $q->andWhere([
                        'exists',
                        (new \yii\db\Query())
                            ->select(new \yii\db\Expression('1'))
                            ->from('ag_users_cities auc')
                            ->where('auc.user_id = u.user_id')
                            ->andWhere(['in', 'auc.city_id', $adminCities])
                    ]);
                } else {
                    // Non-admin with no cities assigned - return empty result
                    return [
                        'code' => 200,
                        'succeeded' => true,
                        'users' => [],
                        'pagination' => [
                            'total_count' => 0,
                            'page_count' => 0,
                            'current_page' => 1,
                            'per_page' => Yii::$app->request->get('per-page', 20),
                        ],
                    ];
                }
            }

            $pager = new Pagination([
                'defaultPageSize' => Yii::$app->request->get('per-page', 20),
                'totalCount' => $q->count(),
            ]);

            $rows = $q->offset($pager->offset)
                ->limit($pager->limit)
                ->asArray()->all();

            // Process user data
            foreach ($rows as &$u) {
                $u['images'] = $this->fetchUserImages($u['user_id']);
                $u['cities'] = (new Query())->select('city_id')
                    ->from('ag_users_cities')
                    ->where(['user_id' => $u['user_id']])->column();
                $u['city_names'] = (new Query())->select('c.city_name')
                    ->from(['auc' => 'ag_users_cities'])
                    ->innerJoin(['c' => 'cities'], 'auc.city_id = c.id')
                    ->where(['auc.user_id' => $u['user_id']])
                    ->column();
                // Get stores from ag_user_stores table
                $userStores = (new Query())
                    ->select([
                        's.id AS store_id',
                        's.store_name',
                        's.store_name_ar',
                        's.store_type',
                        's.store_address',
                        's.store_address_ar',
                        new Expression("
                                CASE 
                                    WHEN a.file_path LIKE 'http%' THEN a.file_path 
                                    ELSE CONCAT(:host, a.file_path) 
                                END AS image
                            ")
                    ])
                    ->from(['aus' => 'ag_user_stores'])
                    ->innerJoin(['s' => 'stores'], 's.id = aus.store_id')
                    ->leftJoin(['a' => 'ag_attachment'], 'a.row_id = s.id AND a.table_name = 225')
                    ->where(['aus.user_id' => $u['user_id']])
                    ->addParams([':host' => Yii::$app->request->hostInfo])
                    ->all();

                $u['stores'] = array_values(array_filter($userStores, function ($store) {
                    return $store['store_type'] === 'Retail Store';
                }));
                $u['restaurants'] = array_values(array_filter($userStores, function ($store) {
                    return $store['store_type'] === 'Restaurant Store';
                }));
            }
            unset($u);

            return [
                'code' => 200,
                'succeeded' => true,
                'users' => $rows,
                'pagination' => [
                    'total_count' => $pager->totalCount,
                    'page_count' => $pager->getPageCount(),
                    'current_page' => $pager->getPage() + 1,
                    'per_page' => $pager->getPageSize(),
                ],
            ];
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return ['succeeded' => false, 'message' => $e->getMessage()];
        }
    }


    /* ─────────────────── UPDATE USER ─────────────────── */
    public function actionUpdateUser($id)
    {
        $tx     = Yii::$app->db->beginTransaction();
        $request       = Yii::$app->request;
        $language_code = $request->headers->get('Language', 'en');
        $token         = $request->headers->get('Authorization');
        $authId   = $this->requireAuth($token);
        try {
            $post = Yii::$app->request->post();
            $u    = AgUsers::findOne($id);
            if (!$u) {
                Yii::$app->response->statusCode = 404;
                return ['succeeded' => false, 'message' => 'User not found'];
            }

            /* ────── 1. uniqueness guards ────── */
            if (
                !empty($post['email_address']) &&
                AgUsers::find()->where(['email_address' => trim($post['email_address'])])
                ->andWhere(['<>', 'user_id', $u->user_id])           // ignore myself
                ->exists()
            ) {
                Yii::$app->response->statusCode = 422;
                return ['succeeded' => false, 'message' => 'Email already exists'];
            }

            if (
                !empty($post['phone_number_one']) &&
                AgUsers::find()->where(['phone_number_one' => trim($post['phone_number_one'])])
                ->andWhere(['<>', 'user_id', $u->user_id])
                ->exists()
            ) {
                Yii::$app->response->statusCode = 422;
                return ['succeeded' => false, 'message' => 'Phone number already exists'];
            }
            /* ────────────────────────────────── */

            $u->load($post, '');
            $u->country = $post['country_code'] ?? null;
            if (!empty($post['user_password'])) {
                $u->user_password = Yii::$app->security
                    ->generatePasswordHash($post['user_password']);
            }
            $u->updated_at = date('Y-m-d H:i:s');
            $u->updated_by = $authId;

            if (!$u->save()) {
                throw new \Exception(json_encode($u->errors));
            }

            /* ─── rebuild pivot tables ─── */
            AgUsersCities::deleteAll(['user_id' => $u->user_id]);
            if (!empty($post['cities'])) {
                foreach ((array)Json::decode($post['cities']) as $cid) {
                    (new AgUsersCities(['user_id' => $u->user_id, 'city_id' => $cid]))->save();
                }
            }

            AgUserStores::deleteAll(['user_id' => $u->user_id]);
            //empty also store_involved_users 
            // StoreInvolvedUsers::deleteAll(['user_id'=>$u->user_id]);

            // Handle both 'stores' and 'store_id' fields (both in array format)
            $stores = [];
            if (!empty($post['stores'])) {
                $stores = is_string($post['stores']) ? (array)Json::decode($post['stores']) : (array)$post['stores'];
            } elseif (!empty($post['store_id'])) {
                $stores = is_string($post['store_id']) ? (array)Json::decode($post['store_id']) : (array)$post['store_id'];
            }

            foreach ($stores as $sid) {
                if (!empty($sid)) {
                    (new AgUserStores(['user_id' => $u->user_id, 'store_id' => $sid]))->save();
                }
            }

            $tx->commit();
            return ['succeeded' => true, 'data' => $u->attributes, 'message' => 'User updated'];
        } catch (\Throwable $e) {
            $tx->rollBack();
            Yii::$app->response->statusCode = 500;
            return ['succeeded' => false, 'message' => $e->getMessage()];
        }
    }
    /* ─────────────────── DELETE USER ─────────────────── */
    public function actionDeleteUser()
    {
        $request       = Yii::$app->request;
        $language_code = $request->headers->get('Language', 'en');
        $token         = $request->headers->get('Authorization');
        $authId        = $this->requireAuth($token);

        try {
            $postData = $request->post();
            $userIds  = $postData['id'] ?? null;

            if (!$userIds) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message'   => Utils::findString("User ID is required", $language_code),
                ];
            }

            // Accept stringified JSON, comma-separated, or a single scalar
            if (is_string($userIds)) {
                $decoded = json_decode($userIds, true);
                if ($decoded === null) {
                    // try comma-separated
                    $parts = array_filter(array_map('trim', explode(',', $userIds)), 'strlen');
                    $userIds = $parts ?: [$userIds];
                } else {
                    $userIds = $decoded;
                }
            }

            if (!is_array($userIds) || empty($userIds)) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message'   => Utils::findString("Invalid user_ids format, must be an array", $language_code),
                ];
            }

            // Normalize to unique integer IDs
            $userIds = array_values(array_unique(array_map('intval', $userIds)));

            // 1) Pre-check: if ANY user is linked to stores, stop and return false + message
            foreach ($userIds as $id) {
                $user = AgUsers::findOne($id);
                if (!$user) {
                    Yii::$app->response->statusCode = 404;
                    return [
                        'succeeded' => false,
                        'message'   => Utils::findString("User not found", $language_code) . " (ID: {$id})",
                    ];
                }

                $hasUserStores = (new \yii\db\Query())
                    ->from('ag_user_stores')
                    ->where(['user_id' => $id])
                    ->exists();

                $hasInvolvedStores = (new \yii\db\Query())
                    ->from('store_involved_users')
                    ->where(['user_id' => $id])
                    ->exists();

                if ($hasUserStores || $hasInvolvedStores) {
                    // Your exact requirement: send false and the error because he has stores
                    Yii::$app->response->statusCode = 409;
                    return [
                        'succeeded' => false,
                        'message'   => Utils::findString(
                            "User cannot be deleted because they are linked to stores.",
                            $language_code
                        ),
                    ];
                }
            }

            // 2) Safe to delete all requested users
            foreach ($userIds as $id) {
                $user = AgUsers::findOne($id);
                if (!$user) {
                    Yii::$app->response->statusCode = 404;
                    return [
                        'succeeded' => false,
                        'message'   => Utils::findString("User not found", $language_code) . " (ID: {$id})",
                    ];
                }

                $tx = Yii::$app->db->beginTransaction();
                try {
                    // Delete attachments (if your schema ties them by row_id)
                    $attachments = AgAttachment::findAll(['row_id' => $id, 'table_name' => AgTablesSchema::findOne(['table_name' => 'ag_users'])->id ?? null]);
                    foreach ($attachments as $attachment) {
                        if ($attachment->delete() === false) {
                            throw new \RuntimeException("Failed to delete attachment ID {$attachment->id}");
                        }
                    }

                    // Log deleted record
                    $agUsersTableId = AgTablesSchema::findOne(['table_name' => 'ag_users'])->id ?? null;
                    if ($agUsersTableId) {
                        $deletedRecord             = new AgDeletedRecords();
                        $deletedRecord->table_id   = $agUsersTableId;
                        $deletedRecord->row_id     = $id;
                        $deletedRecord->created_by = (string)$authId ?: 'system';
                        $deletedRecord->center_num = $user->center_num;
                        if ($deletedRecord->save(false) === false) {
                            throw new \RuntimeException("Failed to log deleted record for user ID {$id}");
                        }
                    }

                    if ($user->delete() === false) {
                        throw new \RuntimeException("Failed to delete user ID {$id}");
                    }

                    $tx->commit();
                } catch (\Throwable $e) {
                    $tx->rollBack();
                    Yii::$app->response->statusCode = 500;
                    return [
                        'succeeded' => false,
                        'message'   => Utils::findString("Delete failed", $language_code) . ": " . $e->getMessage(),
                    ];
                }
            }

            // All requested users deleted successfully
            return [
                'succeeded' => true,
                'message'   => Utils::findString("Deleted successfully", $language_code),
            ];
        } catch (\Throwable $e) {
            // FK safety net / unexpected errors
            $message = $e->getMessage();
            if (strpos($message, 'SQLSTATE[23000]') !== false && strpos($message, '1451') !== false) {
                Yii::$app->response->statusCode = 409;
                $message = Utils::findString("User cannot be deleted because they are linked to stores.", $language_code);
            } else {
                Yii::$app->response->statusCode = 500;
            }

            return [
                'succeeded' => false,
                'message'   => $message,
            ];
        }
    }




    /* ─────────────────── LOGIN (unchanged) ─────────────────── */
    public function actionLogin()
    {
        $p      = Yii::$app->request->post();
        $login  = trim($p['login'] ?? '');
        $pass   = trim($p['password'] ?? '');

        if ($login === '' || $pass === '') {
            Yii::$app->response->statusCode = 400;
            return ['succeeded' => false, 'message' => 'Both login and password are required'];
        }

        $u = AgUsers::find()->where(['email_address' => $login])
            ->orWhere(['phone_number_one' => $login])
            ->orWhere(['phone_number_two' => $login])->one();

        if (!$u) {
            Yii::$app->response->statusCode = 404;
            return ['succeeded' => false, 'message' => 'User not found'];
        }
        if (!Yii::$app->security->validatePassword($pass, $u->user_password)) {
            Yii::$app->response->statusCode = 401;
            return ['succeeded' => false, 'message' => 'Incorrect credentials'];
        }
        if ($u->active !== '1') {
            Yii::$app->response->statusCode = 403;
            return ['succeeded' => false, 'message' => 'Account is not active'];
        }

        // Get user permissions
        $permissions = (new \yii\db\Query())
            ->select([
                'p.table_name',
                'g.group_name',
                'g.group_description',
                'permissions.create',
                'permissions.update',
                'permissions.delete',
                'permissions.view'
            ])
            ->from(['permissions' => 'ag_permissions'])
            ->leftJoin(['p' => 'ag_tables_schema'], 'p.id = permissions.table_id')
            ->leftJoin(['g' => 'ag_user_groups'], 'g.id = permissions.group_id')
            ->where([
                'or',
                ['permissions.user_id' => $u->user_id],
                ['permissions.group_id' => $u->user_role]
            ])
            ->all();

        // Organize permissions by table name for easier access
        $organizedPermissions = [];
        foreach ($permissions as $perm) {
            $tableName = $perm['table_name'];
            if (!isset($organizedPermissions[$tableName])) {
                $organizedPermissions[$tableName] = [
                    'table_name' => $tableName,
                    'group_name' => $perm['group_name'],
                    'group_description' => $perm['group_description'],
                    'create' => (bool)$perm['create'],
                    'update' => (bool)$perm['update'],
                    'delete' => (bool)$perm['delete'],
                    'view' => (bool)$perm['view']
                ];
            } else {
                // If user has both user-specific and group permissions, user-specific takes precedence
                $organizedPermissions[$tableName]['create'] = $organizedPermissions[$tableName]['create'] || (bool)$perm['create'];
                $organizedPermissions[$tableName]['update'] = $organizedPermissions[$tableName]['update'] || (bool)$perm['update'];
                $organizedPermissions[$tableName]['delete'] = $organizedPermissions[$tableName]['delete'] || (bool)$perm['delete'];
                $organizedPermissions[$tableName]['view'] = $organizedPermissions[$tableName]['view'] || (bool)$perm['view'];
            }
        }


        $mainImage = (new \yii\db\Query())
            ->select(['file_path'])
            ->from('ag_attachment')
            ->where([
                'table_name' => 1,
                'row_id' => $u->user_id,
                'type' => 1
            ])
            ->scalar();

        $u->token      = GeneralController::generateToken();
        $u->updated_at = date('Y-m-d H:i:s');
        $u->save(false);

        $uArray = $u->attributes;
        $uArray['main_image'] = $mainImage;

        return [
            'succeeded' => true,
            'user' => $uArray,
            'token' => $u->token,
            'permissions' => array_values($organizedPermissions)
        ];
    }


    public function actionChangePassword()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $request = Yii::$app->request;
            $post = $request->post();
            $token         = $request->headers->get('Authorization');
            $authId   = $this->requireAuth($token);

            // Validate required fields
            foreach (['current_password', 'new_password'] as $field) {
                if (empty($post[$field])) {
                    throw new \yii\web\BadRequestHttpException(
                        Utils::findString("Missing required field: {$field}")
                    );
                }
            }

            // Validate token and get user
            if (!is_string($authId)) {
                if ($authId['succeeded'] == "false") {
                    return $authId;
                }
            }

            $userId = $authId;

            if (!$userId) {
                throw new \yii\web\UnauthorizedHttpException(
                    Utils::findString("User not found")
                );
            }

            // Fetch user from database
            $userModel = AgUsers::findOne($userId);
            if (!$userModel) {
                throw new \yii\web\NotFoundHttpException(
                    Utils::findString("User not found")
                );
            }

            // Verify current password
            if (!Yii::$app->security->validatePassword($post['current_password'], $userModel->user_password)) {
                throw new \yii\web\UnauthorizedHttpException(
                    Utils::findString("Current password is incorrect")
                );
            }

            // Validate new password strength (customize as needed)
            if (strlen($post['new_password']) < 8) {
                throw new \yii\web\BadRequestHttpException(
                    Utils::findString("Password must be at least 8 characters")
                );
            }

            // Ensure new password is different
            if (Yii::$app->security->validatePassword($post['new_password'], $userModel->user_password)) {
                throw new \yii\web\BadRequestHttpException(
                    Utils::findString("New password cannot be same as current password")
                );
            }

            // Update password
            $userModel->user_password = Yii::$app->security->generatePasswordHash($post['new_password']);
            $userModel->updated_at = new \yii\db\Expression('NOW()');
            $userModel->updated_by = $userId;

            if (!$userModel->save()) {
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Failed to update password"),
                    'errors' => $userModel->getErrors()
                ];
            }

            return [
                'succeeded' => true,
                'message' => Utils::findString("Password changed successfully")
            ];
        } catch (\yii\web\HttpException $e) {
            Yii::$app->response->statusCode = 400;
            return [
                'succeeded' => false,
                'message' => $e->getMessage()
            ];
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'succeeded' => false,
                'message' => Utils::findString("Server error"),
                'error' => YII_DEBUG ? [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ];
        }
    }

    public function actionGetPermissions()
    {
        try {
            $token = Yii::$app->request->headers->get('Authorization');
            $userId = $this->requireAuth($token);

            if (!is_string($userId)) {
                return $userId;
            }

            $user = AgUsers::findOne($userId);
            if (!$user) {
                Yii::$app->response->statusCode = 404;
                return ['succeeded' => false, 'message' => 'User not found'];
            }

            // ✅ Static allowed keys with display titles
            $allowedKeys = [
                'admin_dashboard'              => 'Admin Dashboard',
                'municipality_dashboard'       => 'Municipality Dashboard',
                'users'                         => 'Users',
                'dashboard_users'               => 'Dashboard Users',
                'municipality'                  => 'Municipality',
                'news'                          => 'News',
                'breaking_news'                 => 'Breaking News',
                'news_categories'               => 'News Categories',
                'stores'                        => 'Stores',
                'store_categories'              => 'Store Categories',
                'restaurants'                   => 'Restaurants',
                'restaurant_categories'         => 'Restaurant Categories',
                'buy_sell'                       => 'Buy & Sell',
                'buy_sell_categories'            => 'Buy & Sell Categories',
                'buy_sell_slider'                => 'Buy & Sell Slider',
                'lost_items'                     => 'Lost Items',
                'found_items'                    => 'Found Items',
                'lost_found_categories'          => 'Lost & Found Categories',
                'delivery_men'                   => 'Delivery Men',
                'delivery_categories'            => 'Delivery Categories',
                'notifications'                  => 'Announcements',
                'suggestions_claims'             => 'Suggestions & Claims',
                'suggestions_claims_categories'  => 'Suggestions & Claims Categories',
                'slider_data'                    => 'Homepage Slider',
                'modules'                        => 'Modules',
                'ag_user_groups'                 => 'Roles',
                'user_requests'                  => 'User Requests',
                'prof_categories'                => 'Professions Categories',
                'professions'                    => 'Professions',
                'sos'                            => 'SOS',
                'reports'                        => 'Reports',
                'reports_categories'             => 'Reports Categories',
            ];

            // ✅ Map keys to actual DB table_name values
            $lookupMap = [
                'delivery_categories' => 'delivery_cat',
                'dashboard_users'     => 'ag_users',
                'user_requests'       => 'user_requests',
            ];

            // ✅ Get group name
            $groupName = (new \yii\db\Query())
                ->select('group_name')
                ->from('ag_user_groups')
                ->where(['id' => $user->user_role])
                ->scalar();

            // ✅ Prepare actual table names for DB filtering (mapped where needed)
            $tablesForDb = [];
            foreach (array_keys($allowedKeys) as $key) {
                $tablesForDb[] = $lookupMap[$key] ?? $key;
            }

            // ✅ Get permissions for either the user or their group
            $permissions = (new \yii\db\Query())
                ->select([
                    'p.table_name',
                    'g.group_name',
                    'g.group_description',
                    'permissions.create',
                    'permissions.update',
                    'permissions.delete',
                    'permissions.view'
                ])
                ->from(['permissions' => 'ag_permissions'])
                ->leftJoin(['p' => 'ag_tables_schema'], 'p.id = permissions.table_id')
                ->leftJoin(['g' => 'ag_user_groups'], 'g.id = permissions.group_id')
                ->where([
                    'or',
                    ['permissions.user_id' => $user->user_id],
                    ['permissions.group_id' => $user->user_role]
                ])
                ->andWhere(['IN', 'p.table_name', $tablesForDb])
                ->all();

            // ✅ Organize permissions in the same order as allowedKeys
            $organizedPermissions = [];

            foreach ($allowedKeys as $key => $title) {
                $permissionsSet = [
                    'table_name' => $key,
                    'title' => $title,
                    'group_name' => $groupName,
                    'group_description' => null,
                    'create' => false,
                    'update' => false,
                    'delete' => false,
                    'view'   => false,
                ];

                $lookupKey = $lookupMap[$key] ?? $key;

                foreach ($permissions as $perm) {
                    if (strcasecmp($perm['table_name'], $lookupKey) === 0) { // case-insensitive match
                        if (!$permissionsSet['group_description']) {
                            $permissionsSet['group_description'] = $perm['group_description'];
                        }
                        $permissionsSet['create'] |= (bool)$perm['create'];
                        $permissionsSet['update'] |= (bool)$perm['update'];
                        $permissionsSet['delete'] |= (bool)$perm['delete'];
                        $permissionsSet['view']   |= (bool)$perm['view'];
                    }
                }

                $organizedPermissions[$key] = $permissionsSet;
            }

            return [
                'succeeded' => true,
                'user_id' => $user->user_id,
                'permissions' => array_values($organizedPermissions)
            ];
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'succeeded' => false,
                'message' => 'Server error',
                'error' => YII_DEBUG ? $e->getMessage() : null
            ];
        }
    }




    public function actionForgetPassword()
    {
        try {
            $request = Yii::$app->request;
            $language_code = $request->headers->get('Language', 'en');
            $postData = $request->post();
            $fields = [
                'country_code' => $postData['country_code'] ?? "+961",
                'phone_number' => $postData['phone_number'] ?? null,
            ];
            $ipAddress = Yii::$app->request->userIp;
            $missingFields = Self::checkMissingFields($fields);
            if (!empty($missingFields)) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Invalid Data. Missing:", $language_code) . implode(', ', $missingFields) . ".",
                ];
            }
            $phoneNumber = str_replace(' ', '', $fields['phone_number']);
            $countryCode = $fields['country_code'];

            // Clean up phone number input
            $rawPhone = preg_replace('/\D+/', '', $postData['phone_number']); // remove all non-numeric characters

            if (strlen($rawPhone) == 7 && $rawPhone[0] != '0' && $fields['country_code'] == "+961") {
                $rawPhone = '0' . $rawPhone;
            }

            $fields['phone_number'] = $rawPhone;

            $user = AgUsers::find()
                ->where([
                    // 'country' => $countryCode, 
                    'phone_number_one' => $phoneNumber,
                    'active' => 1
                ])
                ->orderBy(['created_at' => SORT_DESC])
                ->one();

            if (!$user) {
                Yii::$app->response->statusCode = 404;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("User not Found", $language_code),
                ];
            }

            $currentDate = date('Y-m-d H:i:s');
            $count = SmsData::find()
                ->where(['phone_number' => $phoneNumber])
                ->andWhere(new \yii\db\Expression('DATE(:currentDate) = DATE(send_date)', [':currentDate' => $currentDate]))
                ->count();
            $canSend = ($count < RESEND_COUNT) && (!$user->reset_code || (time() - strtotime($user->reset_code_date)) >= RESEND_TIME);
            if ($canSend) {
                $code = GeneralController::generateCode();
                $token = GeneralController::generateToken();
                $user->reset_code = $code;
                $user->reset_code_date = $currentDate;
                $user->token = $token;
                if (!$user->save(false)) {
                    throw new \Exception(Utils::findString("Failed to Save User Data.", $language_code));
                }
                $smsSent = $this->sendSMS($phoneNumber, $countryCode, "Your reset code is '$code'", $code, $ipAddress);
                if (!$smsSent) {
                    throw new \Exception(Utils::findString("Failed to Send SMS.", $language_code));
                }
                Yii::$app->response->statusCode = 200;
                return [
                    'succeeded' => true,
                    'message' => Utils::findString("Reset Code Sent Successfully", $language_code),
                ];
            } else {
                throw new Exception(Utils::findString("Maximum SMS limit Reached or Couldn't Send Activation Code", $language_code));
            }
        } catch (Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'succeeded' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function actionCheckResetCode()
    {
        try {
            $request = Yii::$app->request;
            $language_code = $request->headers->get('Language', 'en');
            $postData = $request->post();

            $fields = [
                'country_code' => $postData['country_code'] ?? "+961",
                'phone_number' => $postData['phone_number'] ?? null,
                'code' => $postData['code'] ?? null,
            ];

            if ($missing = self::checkMissingFields($fields)) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Invalid Data. Missing:", $language_code)
                        . implode(', ', $missing) . ".",
                ];
            }

            $fields['phone_number'] = $this->normaliseLebanonPhone(
                $fields['phone_number'],
                $fields['country_code']
            );

            $user = AgUsers::find()
                ->where([
                    // 'country' => $fields['country_code'],
                    'phone_number_one' => $fields['phone_number'],
                    'active' => 1
                ])
                ->orderBy(['created_at' => SORT_DESC])
                ->one();

            if (!$user) {
                Yii::$app->response->statusCode = 404;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("User not Found", $language_code)
                ];
            }

            if ($fields['code'] !== $user->reset_code) {
                Yii::$app->response->statusCode = 404;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Invalid code", $language_code)
                ];
            }

            $age = time() - strtotime($user->reset_code_date);
            if ($age < 0 || $age > EXPIRY_TIME) {
                throw new Exception(Utils::findString("Active Code Expired", $language_code));
            }

            return [
                'succeeded' => true,
                'message' => Utils::findString("Reset Code Checked Successfully", $language_code),
            ];
        } catch (Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'succeeded' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function actionResetPassword()
    {
        try {
            $request = Yii::$app->request;
            $language_code = $request->headers->get('Language', 'en');
            $postData = $request->post();
            $fields = [
                'country_code' => $postData['country_code'] ?? "+961",
                'phone_number' => $postData['phone_number'] ?? null,
                'user_password' => $postData['user_password'] ?? null,
            ];
            $ipAddress = Yii::$app->request->userIp;
            $missingFields = Self::checkMissingFields($fields);
            if (!empty($missingFields)) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Invalid Data. Missing:", $language_code) . implode(', ', $missingFields) . ".",
                ];
            }
            $countryCode = $fields['country_code'];
            $phoneNumber = $fields['phone_number'];
            $password = $fields['user_password'];

            $user = AgUsers::find()
                ->where([
                    // 'countr' => $countryCode, 
                    'phone_number_one' => $phoneNumber,
                    'active' => 1
                ])
                ->orderBy(['created_at' => SORT_DESC])
                ->one();

            if (!$user) {
                Yii::$app->response->statusCode = 404;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Invalid Credentials or Account not Activated.", $language_code),
                ];
            }
            $currentDate = date('Y-m-d H:i:s');

            if (!$user->reset_code || $user->reset_code_date === null) {
                Yii::$app->response->statusCode = 400;
                return [
                    'succeeded' => false,
                    'message' => Utils::findString("Code not found or has expired.", $language_code),
                ];
            }

            $user->user_password = Yii::$app->security->generatePasswordHash($password);
            $user->reset_code = null;
            $user->reset_code_date = null;
            $token = GeneralController::generateToken();
            $user->token = $token;
            $user->save(false);
            $key = "CodeKey-" . uniqid() . "-" . time();
            $updatedUser = $this->getUserData($countryCode, $phoneNumber);
            return [
                'succeeded' => true,
                'message' => Utils::findString("Password Reset Successfully", $language_code),
                'user' => $updatedUser,
                'table_name' => USERS_TABLE,
                'main_image_type' => 1,
                'token' => $token
            ];
        } catch (Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'succeeded' => false,
                'message' => $e->getMessage(),
            ];
        }
    }


    public function getUserData($countryCode = null, $phoneNumber)
    {
        $userDetails = AgUsers::find()
            ->alias('u')
            ->select([
                'u.user_id AS id',
                'u.first_name',
                'u.last_name',
                'u.phone_number_one AS phone_number',
                'u.country AS country_code',
                'u.email_address AS email',
                'u.date_of_birth AS birth_date',
                'u.address',
                'u.city_id',
                'u.province_id',
                'u.token',
                'mc.id AS main_city_id', // may be null
            ])
            ->leftJoin(['uc' => 'user_cities'], 'uc.user_id = u.user_id AND uc.main_city = 1')
            ->leftJoin(['mc' => 'cities'], 'mc.id = uc.city_id')
            ->where([
                'u.phone_number_one' => $phoneNumber,
                'u.active' => 1,
            ])
            ->asArray()
            ->one();

        // ---------- bail early if user doesn’t exist ----------
        if (!$userDetails) {
            return null;
        }

        // ---------- image (optional) ----------
        $userDetails['image'] = AgAttachment::find()
            ->select('file_path')
            ->where([
                'table_name' => 1,
                'type' => 1,
                'row_id' => $userDetails['id'],
            ])
            ->limit(1)
            ->scalar() ?: null;

        // ---------- province (optional) ----------
        $userDetails['province'] = $userDetails['province_id']
            ? Province::find()
            ->select('province')
            ->where(['id' => $userDetails['province_id']])
            ->scalar()
            : null;

        // ---------- main city name (optional) ----------
        $userDetails['city'] = $userDetails['main_city_id']
            ? Cities::find()
            ->select('city_name')
            ->where(['id' => $userDetails['main_city_id']])
            ->scalar()
            : null;

        // ---------- all cities (may be empty) ----------
        $citiesList = AgUsersCities::find()
            ->alias('uc')
            ->select(['uc.city_id', 'c.city_name'])
            ->leftJoin(['c' => Cities::tableName()], 'c.id = uc.city_id')
            ->where(['uc.user_id' => $userDetails['id']])
            ->asArray()
            ->all();

        $userDetails['cities'] = $citiesList; // [] if none
        $userDetails['has_cities'] = !empty($citiesList);

        return $userDetails;
    }

    public static function checkMissingFields(array $fields): array
    {
        $missingFields = [];
        foreach ($fields as $fieldName => $value) {
            if (empty($value)) {
                $missingFields[] = $fieldName;
            }
        }
        return $missingFields;
    }


    private function sendSMS($phone_number, $country_code, $body, $code, $ip_address)
    {

        // $testPhoneNumbers = [
        //     '81698092',
        //     '76091848'
        // ];
        // if (in_array($phone_number, $testPhoneNumbers)) {
        //     return true; // Simulate successful operation
        // }
        $sms_data = new SmsData();
        $sms_data->phone_number = $phone_number;
        $sms_data->sms_code = $code;
        $sms_data->send_date = date('Y-m-d H:i:s');
        $sms_data->ip_address = $ip_address;
        $sms_data->verification_id = GeneralController::generateVerificationId();
        $owner_data = OwnerData::findOne(1);
        $new_total = $owner_data->sms_total + $owner_data->sms_cost;

        // Check if SMS quota is exceeded
        // if ($new_total >= $owner_data->received_sms_payment) {
        //     return false;
        // }

        $sms_data->sms_cost = (float) $owner_data->sms_cost;

        try {
            if ($sms_data->save(false)) {
                // Skip actual SMS sending for test numbers
                // if (in_array($phone_number, $testPhoneNumbers)) {
                //     return true; // Simulate successful operation
                // }

                try {
                    // Uncomment below lines to enable SMS sending
                    $result = $this->sendSmsBulk($phone_number, $country_code, $code);
                    $owner_data->sms_total += $sms_data->sms_cost;
                    $owner_data->save(false);
                    return true;
                } catch (Exception $e) {
                    $sms_data->delete(); // Rollback SMS data on failure
                    return false;
                }
            }
        } catch (Exception $e) {
            return false;
        }
    }


    private function sendSmsBulk($phoneNumber, $countryCode, $code)
    {
        if (!$code) return false;

        // Remove the "+" from country code for the API
        $phoneCode = ltrim($countryCode, '+');

        $payload = json_encode([
            'phoneCode' => $phoneCode,  // "961", "1", "44", etc.
            'phoneNumber' => $phoneNumber, // normalized local number
            'otp' => $code
        ]);
        try {
            $ch = curl_init('https://otp-sender-five.vercel.app/api/messages/send-otp');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlhdCI6MTcyNDMxMTA2M30.DImJ6I86yUDVXCrAOYhkyxJERSgAgO_bPuyH0wnUJ1A',
                'Content-Type: application/json',
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            return $response;
        } catch (Exception $e) {
            return false;
        }
    }

    private function normaliseLebanonPhone(string $phone, string $countryCode): string
    {
        $digits = preg_replace('/\D+/', '', $phone); // keep numeric chars only
        if ($countryCode === '+961' && strlen($digits) === 7 && $digits[0] !== '0') {
            $digits = '0' . $digits;
        }
        return $digits;
    }

    public function actionGenerateNews()
    {
        $apiKey = '759ee1c6a45d41aebf3588124edad7c1';

        // Build request URL
        $query = [
            'q' => 'tesla',
            'from' => '2025-07-02',
            'sortBy' => 'publishedAt',
            'language' => 'en',
            'apiKey' => $apiKey,
        ];
        $url = 'https://newsapi.org/v2/everything?' . http_build_query($query);

        // Send request with Edge browser headers
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return [
                'success' => false,
                'message' => 'Failed to fetch news',
                'http_code' => $httpCode,
                'curl_error' => $curlError,
            ];
        }

        $data = json_decode($response, true);
        if (!isset($data['status']) || $data['status'] !== 'ok') {
            return ['success' => false, 'message' => 'Invalid API response'];
        }

        $articles = $data['articles'];
        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        // Get a valid user for created_by
        $defaultUserId = Yii::$app->db->createCommand('SELECT user_id FROM ag_users ORDER BY user_id ASC LIMIT 1')->queryScalar();
        if (!$defaultUserId) {
            return ['success' => false, 'message' => 'No valid user found in ag_users'];
        }

        $defaultCenter = 1;

        // ID generator
        $generateCustomId = function () {
            return rand(10000, 99999) . '-' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 4);
        };

        // Get remote file size
        $getRemoteFileSize = function ($url) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_NOBODY => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => true,
            ]);
            curl_exec($ch);
            $fileSize = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
            curl_close($ch);
            return $fileSize > 0 ? $fileSize : 0;
        };

        try {
            foreach ($articles as $article) {
                $sourceName = $article['source']['name'] ?? 'Unknown Source';

                // Check or create news category
                $category = (new \yii\db\Query())
                    ->select(['id'])
                    ->from('news_categories')
                    ->where(['category_name' => $sourceName])
                    ->one();

                if (!$category) {
                    $maxAttempts = 5;
                    for ($i = 0; $i < $maxAttempts; $i++) {
                        $categoryId = $generateCustomId();
                        try {
                            $db->createCommand()->insert('news_categories', [
                                'id' => $categoryId,
                                'category_name' => $sourceName,
                                'display' => 1,
                                'order_number' => 0,
                                'main_image' => null,
                                'locked_by' => null,
                                'created_by' => $defaultUserId,
                                'updated_by' => null,
                                'center_num' => $defaultCenter,
                                'created_at' => new \yii\db\Expression('NOW()'),
                                'updated_at' => new \yii\db\Expression('NOW()'),
                            ])->execute();
                            break;
                        } catch (\yii\db\Exception $ex) {
                            if ($i === $maxAttempts - 1) {
                                throw $ex;
                            }
                        }
                    }
                } else {
                    $categoryId = $category['id'];
                }

                // Prepare article data
                $newsId = $generateCustomId();
                $title = isset($article['title']) ? mb_substr($article['title'], 0, 255) : 'Untitled';
                $content = $article['content'] ?? '';
                $image = $article['urlToImage'] ?? null;
                $publishedAt = date('Y-m-d', strtotime($article['publishedAt'] ?? 'now'));
                $author = isset($article['author']) ? mb_substr($article['author'], 0, 255) : null;
                $externalLink = isset($article['url']) ? mb_substr($article['url'], 0, 500) : null;

                // Insert into news
                $db->createCommand()->insert('news', [
                    'id' => $newsId,
                    'title' => $title,
                    'title_ar' => null,
                    'category_id' => $categoryId,
                    'content' => $content,
                    'content_ar' => null,
                    'additional_images' => null,
                    'status' => 'published',
                    'city_id' => null,
                    'main_image' => $image,
                    'attachment_counter' => 0,
                    'locked_by' => null,
                    'created_by' => $defaultUserId,
                    'updated_by' => null,
                    'center_num' => $defaultCenter,
                    'created_at' => new \yii\db\Expression('NOW()'),
                    'updated_at' => new \yii\db\Expression('NOW()'),
                    'view_count' => 0,
                    'published_date' => $publishedAt,
                    'author' => $author,
                    'external_link' => $externalLink,
                    'expiry_date' => null,
                ])->execute();

                // Insert into ag_attachment if main image exists
                if ($image) {
                    $fileName = basename(parse_url($image, PHP_URL_PATH));
                    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $fileSize = $getRemoteFileSize($image);

                    $db->createCommand()->insert('ag_attachment', [
                        'table_name' => '222',
                        'row_id' => $newsId,
                        'type' => 0,
                        'file_path' => $image,
                        'file_name' => $fileName,
                        'file_extension' => $fileExtension,
                        'cdn_uploaded' => 0,
                        'created_at' => new \yii\db\Expression('NOW()'),
                        'file_size' => $fileSize,
                        'updated_at' => new \yii\db\Expression('NOW()'),
                    ])->execute();
                }
            }

            $transaction->commit();
            return ['success' => true, 'inserted_articles' => count($articles)];
        } catch (\Exception $e) {
            $transaction->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function actionGenerateProductsForStore()
    {
        $transaction = Yii::$app->db->beginTransaction();

        try {
            // Fetch data from DummyJSON API
            $url = 'https://dummyjson.com/products?limit=300';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if (curl_error($ch)) {
                throw new Exception('Curl error: ' . curl_error($ch));
            }

            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception('HTTP Error: ' . $httpCode);
            }

            $data = Json::decode($response);

            if (!isset($data['products']) || empty($data['products'])) {
                throw new Exception('No products found in API response');
            }

            // Get all retail stores with their store_category_id
            $stores = Yii::$app->db->createCommand("
            SELECT s.id, s.store_category 
            FROM stores s
            WHERE s.store_type = 'Retail Store'
              AND s.store_category IS NOT NULL
        ")->queryAll();

            if (empty($stores)) {
                throw new Exception('No retail stores with categories found');
            }

            // Get all categories that are linked to store categories
            $categories = Yii::$app->db->createCommand("
            SELECT c.id, c.store_category_id
            FROM categories c
            WHERE c.store_category_id IS NOT NULL
        ")->queryAll();

            if (empty($categories)) {
                throw new Exception('No store-linked categories found');
            }

            // Group categories by store_category_id for quick lookup
            $categoriesByStoreCategory = [];
            foreach ($categories as $category) {
                $categoriesByStoreCategory[$category['store_category_id']][] = $category['id'];
            }

            // Get product brands if any exist
            $brands = Yii::$app->db->createCommand("
            SELECT id FROM product_brands
        ")->queryAll();

            $processedCount = 0;

            foreach ($data['products'] as $product) {

                // Select random store that has a store_category_id
                $randomStore = $stores[array_rand($stores)];
                $storeId = $randomStore['id'];
                $storeCategoryId = $randomStore['store_category'];

                // Get available categories for this store's store_category
                if (!isset($categoriesByStoreCategory[$storeCategoryId])) {
                    continue; // Skip if no categories for this store's category
                }

                $availableCategories = $categoriesByStoreCategory[$storeCategoryId];
                $randomCategoryId = $availableCategories[array_rand($availableCategories)];

                // Generate unique product ID
                $productId = $this->generateUniqueId();

                // // Select random store that has categories
                // $randomStoreId = array_rand($storeCategories);
                // $storeCategoriesList = $storeCategories[$randomStoreId];

                // // Select random category from this store's available categories
                // $randomCategoryId = $storeCategoriesList[array_rand($storeCategoriesList)];

                $randomBrand = !empty($brands) ? $brands[array_rand($brands)]['id'] : null;

                // Generate slug from title
                $slug = $this->generateSlug($product['title']);

                // Determine product condition
                $conditions = ['new', 'used', 'free'];
                $condition = $conditions[array_rand($conditions)];

                // Random discount and free status
                $isFree = rand(0, 100) < 5 ? 1 : 0; // 5% chance to be free
                $hasDiscount = rand(0, 100) < 20 ? 1 : 0; // 20% chance for discount
                $discount = $hasDiscount ? rand(5, 50) : 0;

                // Random view duration
                $viewDurations = ['10', '30', '60'];
                $viewDuration = $viewDurations[array_rand($viewDurations)];

                // Random quantity
                $quantity = rand(1, 100);

                // Price handling
                $price = $isFree ? null : $product['price'];

                // Random user ID (you might want to adjust this based on your user system)
                $userId = null; // Default user or you can randomize from existing users
                $created_by = '10548-0e2a';

                // Insert product
                Yii::$app->db->createCommand()->insert('products', [
                    'id' => $productId,
                    'product_name' => substr($product['title'], 0, 255),
                    'barcode' => isset($product['meta']['barcode']) ? $product['meta']['barcode'] : null,
                    'description' => $product['description'],
                    'quantity' => $quantity,
                    'boolean_percent_discount' => $hasDiscount,
                    'sales_discount' => $discount,
                    'free' => $isFree,
                    'product_price' => $price,
                    'product_brand' => $randomBrand,
                    'product_condition' => $condition,
                    'slug' => $slug,
                    'store_id' => $storeId,
                    'user_id' => $userId,
                    'view_duration' => $viewDuration,
                    'main_image' => isset($product['thumbnail']) ? $product['thumbnail'] : null,
                    'show_hide' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'attachment_counter' => 0,
                    'created_by' => $created_by,
                    'center_num' => 10,
                    'product_name_ar' => substr($product['title'], 0, 255),
                    'description_ar' => $product['description'],
                    'status' => 'accepted'
                ])->execute();

                // Insert product category relationship
                $productCategoryId = $this->generateUniqueId();
                Yii::$app->db->createCommand()->insert('product_categories', [
                    'id' => $productCategoryId,
                    'product_id' => $productId,
                    'product_category_id' => $randomCategoryId
                ])->execute();

                // Insert attachment record for main image if exists (type = 1)
                if (isset($product['thumbnail']) && !empty($product['thumbnail'])) {
                    $attachmentId = $this->getNextAttachmentId();
                    $fileName = basename($product['thumbnail']);
                    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                    Yii::$app->db->createCommand()->insert('ag_attachment', [
                        'id' => $attachmentId,
                        'table_name' => '72', // products table
                        'row_id' => $productId,
                        'type' => 1, // Main image type = 1
                        'file_path' => $product['thumbnail'],
                        'file_name' => $fileName,
                        'file_extension' => $fileExtension ?: 'jpg',
                        'cdn_uploaded' => 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'file_size' => '0', // Set as string '0' instead of null
                        'updated_at' => date('Y-m-d H:i:s')
                    ])->execute();

                    // Update product attachment counter
                    Yii::$app->db->createCommand()->update(
                        'products',
                        ['attachment_counter' => 1],
                        ['id' => $productId]
                    )->execute();
                }

                // Insert additional images if available (type = 0)
                if (isset($product['images']) && is_array($product['images'])) {
                    $imageCounter = 1; // Start from 1 since main image is already counted

                    foreach ($product['images'] as $index => $imageUrl) {
                        if ($index === 0) continue; // Skip first image as it's the main image

                        $attachmentId = $this->getNextAttachmentId();
                        $fileName = basename($imageUrl);
                        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                        Yii::$app->db->createCommand()->insert('ag_attachment', [
                            'id' => $attachmentId,
                            'table_name' => '72',
                            'row_id' => $productId,
                            'type' => 0, // Additional images type = 0
                            'file_path' => $imageUrl,
                            'file_name' => $fileName,
                            'file_extension' => $fileExtension ?: 'jpg',
                            'cdn_uploaded' => 0,
                            'created_at' => date('Y-m-d H:i:s'),
                            'file_size' => '0', // Set as string '0' instead of null
                            'updated_at' => date('Y-m-d H:i:s')
                        ])->execute();

                        $imageCounter++;

                        // Limit to reasonable number of images
                        if ($imageCounter >= 5) break;
                    }

                    // Update final attachment counter
                    if ($imageCounter > 1) {
                        Yii::$app->db->createCommand()->update(
                            'products',
                            ['attachment_counter' => $imageCounter],
                            ['id' => $productId]
                        )->execute();
                    }
                }

                $processedCount++;
            }

            $transaction->commit();

            return [
                'success' => true,
                'message' => "Successfully created {$processedCount} products",
                'count' => $processedCount
            ];
        } catch (Exception $e) {
            $transaction->rollBack();

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }


    public function actionGenerateProductsForBuyAndSell()
    {
        $transaction = Yii::$app->db->beginTransaction();

        try {
            // Fetch data from DummyJSON API
            $url = 'https://dummyjson.com/products?limit=100';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if (curl_error($ch)) {
                throw new Exception('Curl error: ' . curl_error($ch));
            }

            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception('HTTP Error: ' . $httpCode);
            }

            $data = Json::decode($response);

            if (!isset($data['products']) || empty($data['products'])) {
                throw new Exception('No products found in API response');
            }

            // // Get retail stores only
            // $retailStores = Yii::$app->db->createCommand("
            //     SELECT id FROM stores 
            //     WHERE store_type = 'Retail Store'
            // ")->queryAll();

            // if (empty($retailStores)) {
            //     throw new Exception('No retail stores found');
            // }

            // Get categories with type = 1 (store categories)
            $categories = Yii::$app->db->createCommand("
            SELECT id FROM categories 
            WHERE category_type = 0
        ")->queryAll();

            if (empty($categories)) {
                throw new Exception('No store categories found');
            }

            // Get product brands if any exist
            $brands = Yii::$app->db->createCommand("
            SELECT id FROM product_brands
        ")->queryAll();

            $users =  Yii::$app->db->createCommand("
                SELECT id FROM users
            ")->queryAll();

            $processedCount = 0;

            foreach ($data['products'] as $product) {
                // Generate unique product ID
                $productId = $this->generateUniqueId();

                // Select random store and category
                // $randomStore = $retailStores[array_rand($retailStores)];
                $randomCategory = $categories[array_rand($categories)];
                $randomBrand = !empty($brands) ? $brands[array_rand($brands)]['id'] : null;
                $userId = $users[array_rand($users)]['id'];

                // Generate slug from title
                $slug = $this->generateSlug($product['title']);

                // Determine product condition
                $conditions = ['new', 'used', 'free'];
                $condition = $conditions[array_rand($conditions)];

                // Random discount and free status
                $isFree = rand(0, 100) < 5 ? 1 : 0; // 5% chance to be free
                $hasDiscount = rand(0, 100) < 20 ? 1 : 0; // 20% chance for discount
                $discount = $hasDiscount ? rand(5, 50) : 0;

                // Random view duration
                $viewDurations = ['10', '30', '60'];
                $viewDuration = $viewDurations[array_rand($viewDurations)];

                // Random quantity
                $quantity = rand(1, 100);

                // Price handling
                $price = $isFree ? null : $product['price'];

                // Random user ID (you might want to adjust this based on your user system)
                // $created_by = '10548-0e2a';

                // Insert product
                Yii::$app->db->createCommand()->insert('products', [
                    'id' => $productId,
                    'product_name' => substr($product['title'], 0, 255),
                    'barcode' => isset($product['meta']['barcode']) ? $product['meta']['barcode'] : null,
                    'description' => $product['description'],
                    'quantity' => $quantity,
                    'boolean_percent_discount' => $hasDiscount,
                    'sales_discount' => $discount,
                    'free' => $isFree,
                    'product_price' => $price,
                    'product_brand' => $randomBrand,
                    'product_condition' => $condition,
                    'slug' => $slug,
                    'store_id' => null,
                    'user_id' => $userId,
                    'view_duration' => $viewDuration,
                    'main_image' => isset($product['thumbnail']) ? $product['thumbnail'] : null,
                    'show_hide' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'attachment_counter' => 0,
                    'created_by' => $userId,
                    'center_num' => 10,
                    'product_name_ar' => substr($product['title'], 0, 255), // You might want to translate this
                    'description_ar' => $product['description'], // You might want to translate this
                    'status' => 'accepted'
                ])->execute();

                // Insert product category relationship
                $productCategoryId = $this->generateUniqueId();
                Yii::$app->db->createCommand()->insert('product_categories', [
                    'id' => $productCategoryId,
                    'product_id' => $productId,
                    'product_category_id' => $randomCategory['id']
                ])->execute();

                // Insert attachment record for main image if exists (type = 1)
                if (isset($product['thumbnail']) && !empty($product['thumbnail'])) {
                    $attachmentId = $this->getNextAttachmentId();
                    $fileName = basename($product['thumbnail']);
                    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                    Yii::$app->db->createCommand()->insert('ag_attachment', [
                        'id' => $attachmentId,
                        'table_name' => '72', // products table
                        'row_id' => $productId,
                        'type' => 1, // Main image type = 1
                        'file_path' => $product['thumbnail'],
                        'file_name' => $fileName,
                        'file_extension' => $fileExtension ?: 'jpg',
                        'cdn_uploaded' => 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'file_size' => '0', // Set as string '0' instead of null
                        'updated_at' => date('Y-m-d H:i:s')
                    ])->execute();

                    // Update product attachment counter
                    Yii::$app->db->createCommand()->update(
                        'products',
                        ['attachment_counter' => 1],
                        ['id' => $productId]
                    )->execute();
                }

                // Insert additional images if available (type = 0)
                if (isset($product['images']) && is_array($product['images'])) {
                    $imageCounter = 1; // Start from 1 since main image is already counted

                    foreach ($product['images'] as $index => $imageUrl) {
                        if ($index === 0) continue; // Skip first image as it's the main image

                        $attachmentId = $this->getNextAttachmentId();
                        $fileName = basename($imageUrl);
                        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                        Yii::$app->db->createCommand()->insert('ag_attachment', [
                            'id' => $attachmentId,
                            'table_name' => '72',
                            'row_id' => $productId,
                            'type' => 0, // Additional images type = 0
                            'file_path' => $imageUrl,
                            'file_name' => $fileName,
                            'file_extension' => $fileExtension ?: 'jpg',
                            'cdn_uploaded' => 0,
                            'created_at' => date('Y-m-d H:i:s'),
                            'file_size' => '0', // Set as string '0' instead of null
                            'updated_at' => date('Y-m-d H:i:s')
                        ])->execute();

                        $imageCounter++;

                        // Limit to reasonable number of images
                        if ($imageCounter >= 5) break;
                    }

                    // Update final attachment counter
                    if ($imageCounter > 1) {
                        Yii::$app->db->createCommand()->update(
                            'products',
                            ['attachment_counter' => $imageCounter],
                            ['id' => $productId]
                        )->execute();
                    }
                }

                $processedCount++;
            }

            $transaction->commit();

            return [
                'success' => true,
                'message' => "Successfully created {$processedCount} products",
                'count' => $processedCount
            ];
        } catch (Exception $e) {
            $transaction->rollBack();

            return [
                'success' => false,
                'message' => 'Error: ' . $e,
                'count' => 0
            ];
        }
    }

    public function actionGenerateSuggestionsAndClaims()
    {
        $transaction = Yii::$app->db->beginTransaction();
        try {
            $categories = Yii::$app->db->createCommand("SELECT id FROM categories WHERE category_type = 5")->queryAll();
            $users = Yii::$app->db->createCommand("SELECT id FROM users")->queryAll();
            $cities = Yii::$app->db->createCommand("SELECT id FROM cities WHERE show_hide = 1")->queryAll();

            if (empty($categories) || empty($users) || empty($cities)) {
                throw new \Exception("Required data (categories, users, cities) not found.");
            }

            // ✅ Load from JSON
            $jsonPath = Yii::getAlias('@app/data/suggestions_claims.json');
            if (!file_exists($jsonPath)) {
                throw new \Exception("JSON file not found.");
            }

            $entries = json_decode(file_get_contents($jsonPath), true);
            if (!is_array($entries)) {
                throw new \Exception("Invalid JSON data.");
            }

            $inserted = 0;

            foreach ($entries as $entry) {
                $categoryId = $categories[array_rand($categories)]['id'];
                $userId = $users[array_rand($users)]['id'];
                $cityId = $cities[array_rand($cities)]['id'];

                Yii::$app->db->createCommand()->insert('suggestions_claims', [
                    'id' => $this->generateUniqueId(),
                    'type' => $entry['type'],
                    'details' => $entry['details'],
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'category_id' => $categoryId,
                    'city_id' => $cityId,
                    'created_by' => $userId,
                    'status' => 'pending',
                    'is_replied' => 0,
                    'center_num' => 10
                ])->execute();

                $inserted++;
            }

            $transaction->commit();
            return [
                'success' => true,
                'message' => "Inserted $inserted suggestions/claims from JSON"
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function actionGenerateMenuItems()
    {
        $transaction = Yii::$app->db->beginTransaction();

        try {
            // Load menu data from JSON file
            $jsonFile = Yii::getAlias('@app/data/menu_items.json');

            if (!file_exists($jsonFile)) {
                throw new Exception("Menu JSON file not found: $jsonFile");
            }

            $jsonContent = file_get_contents($jsonFile);
            $data = Json::decode($jsonContent);

            if (!isset($data[0]['products']) || empty($data[0]['products'])) {
                throw new Exception('No products found in API response');
            }

            // Get restaurant stores with their store_category_id
            $stores = Yii::$app->db->createCommand("
            SELECT s.id, s.store_category 
            FROM stores s
            WHERE s.store_type = 'Restaurant Store'
              AND s.store_category IS NOT NULL
        ")->queryAll();

            if (empty($stores)) {
                throw new Exception('No restaurant stores with categories found');
            }

            // Get all categories that are linked to store categories (type = 2 for restaurants)
            $categories = Yii::$app->db->createCommand("
            SELECT c.id, c.store_category_id, c.parent
            FROM categories c
            WHERE c.store_category_id IS NOT NULL
              AND c.category_type = 2
        ")->queryAll();

            if (empty($categories)) {
                throw new Exception('No store-linked categories found');
            }

            $categoryHierarchy = [];
            foreach ($categories as $cat) {
                if ($cat['parent'] === null) {
                    $categoryHierarchy[$cat['store_category_id']]['parents'][] = $cat['id'];
                } else {
                    $categoryHierarchy[$cat['store_category_id']]['children'][] = $cat['id'];
                }
            }

            // Get product brands if any exist
            $brands = Yii::$app->db->createCommand("
            SELECT id FROM product_brands
        ")->queryAll();

            $processedCount = 0;

            foreach ($data[0]['products'] as $product) {
                // Select random store that has a store_category_id
                $randomStore = $stores[array_rand($stores)];
                $storeId = $randomStore['id'];
                $storeCategoryId = $randomStore['store_category'];

                // Get available categories for this store's store_category
                if (!isset($categoryHierarchy[$storeCategoryId])) {
                    continue;
                }

                $availableCategories = [];

                if (!empty($categoryHierarchy[$storeCategoryId]['parents'])) {
                    $availableCategories = $categoryHierarchy[$storeCategoryId]['parents'];
                } elseif (!empty($categoryHierarchy[$storeCategoryId]['children'])) {
                    $availableCategories = $categoryHierarchy[$storeCategoryId]['children'];
                } else {
                    continue;
                }

                $randomCategoryId = $availableCategories[array_rand($availableCategories)];
                // Generate unique product ID
                $productId = $this->generateUniqueId();

                $randomBrand = !empty($brands) ? $brands[array_rand($brands)]['id'] : null;

                // Generate slug from title
                $slug = $this->generateSlug($product['product_name']);

                // Restaurant-specific defaults
                $isFree = 0; // Menu items typically aren't free
                $quantity = 1; // Fixed quantity for menu items

                // Insert product with restaurant-specific settings
                Yii::$app->db->createCommand()->insert('products', [
                    'id' => $productId,
                    'product_name' => substr($product['product_name'], 0, 255),
                    'barcode' => isset($product['meta']['barcode']) ? $product['meta']['barcode'] : null,
                    'description' => $product['description'],
                    'quantity' => $quantity,
                    'boolean_percent_discount' => $product['boolean_percent_discount'],
                    'sales_discount' => $product['sales_discount'],
                    'free' => $isFree,
                    'product_price' => $product['product_price'],
                    'product_brand' => $randomBrand,
                    'product_condition' => null, // Typically not used for food items
                    'slug' => $slug,
                    'store_id' => $storeId,
                    'user_id' => null,
                    'view_duration' => null, // Not typically used for menu items
                    'main_image' =>  null,
                    'show_hide' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'attachment_counter' => 0,
                    'created_by' => '10548-0e2a',
                    'center_num' => 10,
                    'product_name_ar' => substr($product['product_name_ar'], 0, 255),
                    'description_ar' => $product['description_ar'],
                    'status' => 'accepted'
                ])->execute();

                // Insert product category relationship
                $productCategoryId = $this->generateUniqueId();
                Yii::$app->db->createCommand()->insert('product_categories', [
                    'id' => $productCategoryId,
                    'product_id' => $productId,
                    'product_category_id' => $randomCategoryId
                ])->execute();

                // Insert attachment record for main image if exists (type = 1)
                if (isset($product['main_image']) && !empty($product['main_image'])) {
                    $attachmentId = $this->getNextAttachmentId();
                    $fileName = basename($product['main_image']);
                    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                    Yii::$app->db->createCommand()->insert('ag_attachment', [
                        'id' => $attachmentId,
                        'table_name' => '72', // products table
                        'row_id' => $productId,
                        'type' => 1, // Main image type = 1
                        'file_path' => $product['main_image'],
                        'file_name' => $fileName,
                        'file_extension' => $fileExtension ?: 'jpg',
                        'cdn_uploaded' => 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'file_size' => '0',
                        'updated_at' => date('Y-m-d H:i:s')
                    ])->execute();

                    Yii::$app->db->createCommand()->update(
                        'products',
                        ['attachment_counter' => 1],
                        ['id' => $productId]
                    )->execute();
                }

                // Insert additional images if available (type = 0)
                if (isset($product['other_images']) && is_array($product['other_images'])) {
                    $imageCounter = 1; // Start from 1 since main image is already counted

                    foreach ($product['other_images'] as $index => $imageUrl) {
                        if ($index === 0) continue;

                        $attachmentId = $this->getNextAttachmentId();
                        $fileName = basename($imageUrl);
                        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                        Yii::$app->db->createCommand()->insert('ag_attachment', [
                            'id' => $attachmentId,
                            'table_name' => '72',
                            'row_id' => $productId,
                            'type' => 0, // Additional images type = 0
                            'file_path' => $imageUrl,
                            'file_name' => $fileName,
                            'file_extension' => $fileExtension ?: 'jpg',
                            'cdn_uploaded' => 0,
                            'created_at' => date('Y-m-d H:i:s'),
                            'file_size' => '0',
                            'updated_at' => date('Y-m-d H:i:s')
                        ])->execute();

                        $imageCounter++;
                        if ($imageCounter >= 5) break;
                    }

                    if ($imageCounter > 1) {
                        Yii::$app->db->createCommand()->update(
                            'products',
                            ['attachment_counter' => $imageCounter],
                            ['id' => $productId]
                        )->execute();
                    }
                }

                $processedCount++;
            }

            $transaction->commit();

            return [
                'success' => true,
                'message' => "Successfully created {$processedCount} menu items",
                'count' => $processedCount
            ];
        } catch (Exception $e) {
            $transaction->rollBack();

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }


    public function actionGenerateDeliveryMen()
    {
        $transaction = Yii::$app->db->beginTransaction();

        try {
            // Load delivery men data from JSON file
            $jsonFile = Yii::getAlias('@app/data/delivery_man.json');

            if (!file_exists($jsonFile)) {
                throw new Exception("Delivery men JSON file not found: $jsonFile");
            }

            $jsonContent = file_get_contents($jsonFile);
            $data = Json::decode($jsonContent);

            if (empty($data)) {
                throw new Exception('No delivery men data found in JSON');
            }

            // Get random active cities
            $cities = Yii::$app->db->createCommand("
            SELECT id FROM cities WHERE show_hide = 1
        ")->queryAll();

            if (empty($cities)) {
                throw new Exception('No active cities found');
            }

            // Get all delivery categories
            $deliveryCategories = Yii::$app->db->createCommand("
            SELECT id FROM delivery_categories
        ")->queryAll();

            if (empty($deliveryCategories)) {
                throw new Exception('No delivery categories found');
            }

            // Static working hours
            $startHour = '08:00:00';
            $endHour = '20:00:00';

            $processedCount = 0;

            foreach ($data as $deliveryMan) {
                // Validate required fields
                if (empty($deliveryMan['first_name'])) {
                    continue;
                }

                // Select random city and delivery category
                $randomCity = $cities[array_rand($cities)]['id'];
                $randomCategory = $deliveryCategories[array_rand($deliveryCategories)]['id'];

                $deliveryCityId = $this->generateUniqueId();
                // Generate unique ID
                $deliveryManId = $this->generateUniqueId();

                // Insert delivery man with main_image
                Yii::$app->db->createCommand()->insert('delivery_men', [
                    'id' => $deliveryManId,
                    'first_name' => substr($deliveryMan['first_name'], 0, 100),
                    'last_name' => substr($deliveryMan['last_name'] ?? '', 0, 100),
                    'delivery_category' => $randomCategory,
                    'main_image' => null,
                    'phone_number' => '78953186',
                    'city_id' => null,
                    'start_working_hour' => $startHour,
                    'end_working_hour' => $endHour,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'isActive' => 1,
                    'description' => $deliveryMan['description'] ?? ''
                ])->execute();

                // Insert into delivery_man_cities junction table
                Yii::$app->db->createCommand()->insert('delivery_man_cities', [
                    'id' => $deliveryCityId,
                    'delivery_man_id' => $deliveryManId,
                    'city_id' => $randomCity,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ])->execute();

                // Handle image attachment if exists
                if (!empty($deliveryMan['main_image'])) {
                    $this->saveDeliveryManImage($deliveryManId, $deliveryMan['main_image']);
                }

                $processedCount++;
            }

            $transaction->commit();

            return [
                'success' => true,
                'message' => "Successfully created {$processedCount} delivery men",
                'count' => $processedCount
            ];
        } catch (Exception $e) {
            $transaction->rollBack();
            Yii::error("Delivery men generation failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'count' => 0
            ];
        }
    }

    protected function saveDeliveryManImage($deliveryManId, $imageUrl)
    {
        $attachmentId = $this->getNextAttachmentId();
        $fileName = basename(parse_url($imageUrl, PHP_URL_PATH));
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION) ?: 'jpg';

        Yii::$app->db->createCommand()->insert('ag_attachment', [
            'id' => $attachmentId,
            'table_name' => '236', // delivery_men table
            'row_id' => $deliveryManId,
            'type' => 1, // Main image
            'file_path' => $imageUrl,
            'file_name' => $fileName,
            'file_extension' => $fileExtension,
            'cdn_uploaded' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'file_size' => '0',
            'updated_at' => date('Y-m-d H:i:s')
        ])->execute();
    }



    /**
     * Generate unique ID in the format used by your system
     * @return string
     */
    private function generateUniqueId()
    {
        return rand(1000, 99999) . '-' . substr(md5(uniqid(rand(), true)), 0, 4);
    }

    /**
     * Generate URL-friendly slug from title
     * @param string $title
     * @return string
     */
    private function generateSlug($title)
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '_', $slug);
        $slug = preg_replace('/_+/', '_', $slug);
        $slug = trim($slug, '_');
        return substr($slug, 0, 100);
    }

    /**
     * Get next available attachment ID
     * @return int
     */
    private function getNextAttachmentId()
    {
        $maxId = Yii::$app->db->createCommand("
        SELECT COALESCE(MAX(id), 0) + 1 as next_id 
        FROM ag_attachment
    ")->queryScalar();

        return $maxId;
    }
}
