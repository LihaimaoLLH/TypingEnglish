<?php
header('Content-Type: application/json');

// 验证输入
$errors = [];
$data = [];

if (empty($_POST['name'])) {
    $errors['name'] = '姓名是必填项';
}

if (empty($_POST['email'])) {
    $errors['email'] = '电子邮箱是必填项';
} elseif (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = '电子邮箱格式不正确';
}

if (empty($_POST['message'])) {
    $errors['message'] = '消息内容是必填项';
}

if (empty($_POST['consent']) || $_POST['consent'] !== 'on') {
    $errors['consent'] = '必须同意隐私政策';
}

if (!empty($errors)) {
    $data['success'] = false;
    $data['errors'] = $errors;
} else {
    // 处理表单数据
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);
    
    // 邮件配置
    $to = 'contact@typingenglish.com';
    $email_subject = "TypingEnglish 联系表单: $subject";
    $email_body = "您收到一条新消息:\n\n".
                  "姓名: $name\n".
                  "电子邮箱: $email\n".
                  "主题: $subject\n\n".
                  "消息内容:\n$message";
    $headers = "From: $email";
    
    // 发送邮件
    if (mail($to, $email_subject, $email_body, $headers)) {
        $data['success'] = true;
        $data['message'] = '感谢您的消息!我们会尽快回复您。';
        
        // 可选: 将消息保存到数据库
        try {
            $pdo = new PDO('mysql:host=localhost;dbname=typingenglish', 'username', 'password');
            $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message, created_at) 
                                  VALUES (:name, :email, :subject, :message, NOW())");
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':subject' => $subject,
                ':message' => $message
            ]);
        } catch (PDOException $e) {
            // 记录错误但不影响用户体验
            error_log("数据库错误: " . $e->getMessage());
        }
    } else {
        $data['success'] = false;
        $data['message'] = '发送消息时出错，请稍后再试。';
    }
}

echo json_encode($data);
?>