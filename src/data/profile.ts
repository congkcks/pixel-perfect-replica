export const profile = {
  name: "Vũ Văn Hà Công",
  shortName: "Công",
  location: "Hà Nội, Việt Nam",
  education: {
    degree: "Cựu sinh viên ngành Công nghệ Thông tin",
    school: "Trường Đại học Giao thông Vận tải (UTC)",
    gpa: "3.32",
  },
  tagline: "Người yêu công nghệ, đam mê AI và đang trên hành trình chinh phục tiếng Anh.",
  intro:
    "Mình là Công, một người thích tạo ra những sản phẩm công nghệ giải quyết vấn đề thực tế. Website này là nơi mình ghi lại hành trình 100 ngày học tiếng Anh của chính mình.",
  quote: "Trân trọng hành trình đã qua, vững vàng bước tiếp vào tương lai.",
  interests: [
    "Computer Vision",
    "Artificial Intelligence",
    "Machine Learning",
    "Phát triển ứng dụng Web",
    "Tích hợp AI vào sản phẩm thực tế",
    "Công cụ hỗ trợ học tiếng Anh",
  ],
  story: [
    "Mình là Vũ Văn Hà Công, cựu sinh viên ngành Công nghệ Thông tin tại Trường Đại học Giao thông Vận tải (UTC). Những năm tháng đại học đã giúp mình xây dựng nền tảng lập trình, khám phá trí tuệ nhân tạo và phát triển niềm yêu thích với các sản phẩm công nghệ giải quyết vấn đề thực tế.",
    "Mình đặc biệt quan tâm đến Computer Vision, AI và phát triển ứng dụng Web. Ngoài việc học hỏi công nghệ, mình cũng đang dành thời gian cải thiện khả năng tiếng Anh thông qua hành trình 100 ngày học tập và chia sẻ kiến thức trên website này.",
  ],
  timeline: [
    {
      title: "Thời sinh viên – Đại học Giao thông Vận tải",
      points: [
        "Chuyên ngành Công nghệ Thông tin.",
        "GPA 3.32.",
        "Tích lũy nền tảng lập trình và phát triển phần mềm.",
      ],
    },
    {
      title: "Khám phá AI & Computer Vision",
      points: [
        "Tìm hiểu YOLO, OpenCV và PyTorch.",
        "Xây dựng các dự án nhận diện đối tượng, phân loại chất lượng và theo dõi chuyển động.",
      ],
    },
    {
      title: "Phát triển các sản phẩm Web & AI",
      points: [
        "Xây dựng ứng dụng ReactJS, ASP.NET Core và PostgreSQL.",
        "Tích hợp Gemini API và công nghệ xử lý giọng nói.",
      ],
    },
    {
      title: "100 Ngày Học Tiếng Anh",
      points: [
        "Rèn luyện tiếng Anh mỗi ngày.",
        "Ghi chép và chia sẻ kiến thức.",
        "Từng bước cải thiện khả năng giao tiếp.",
      ],
    },
  ],
  skillGroups: [
    {
      name: "Computer Vision & AI",
      skills: [
        "YOLOv8 / YOLOv11",
        "OpenCV",
        "PyTorch",
        "Object Detection & Tracking",
        "Google Gemini API",
        "Whisper STT",
      ],
    },
    {
      name: "Backend",
      skills: [
        "ASP.NET Core",
        "Entity Framework Core",
        "PostgreSQL",
        "Java Spring",
        "Python FastAPI / Flask",
      ],
    },
    {
      name: "Frontend",
      skills: ["ReactJS", "Tailwind CSS", "HTML / CSS", "JavaScript"],
    },
    {
      name: "DevOps & Tools",
      skills: ["Docker", "Git", "GitHub Actions", "WSL2"],
    },
    {
      name: "Testing",
      skills: ["Selenium WebDriver", "JUnit", "Unit Testing"],
    },
  ],
  projects: [
    {
      name: "Tomato Detection & Quality Classification",
      description:
        "Hệ thống ứng dụng Computer Vision để nhận diện cà chua, phân loại độ chín và hỗ trợ phát hiện dấu hiệu sâu bệnh.",
      tech: ["Python", "YOLOv8", "OpenCV", "PyTorch", "FastAPI"],
      github: "https://github.com/congkcks",
      theme: "tomato",
    },
    {
      name: "Livestock Smart Counting",
      description:
        "Hệ thống đếm số lượng lợn tự động qua camera, kết hợp Object Detection và Multi-Object Tracking để hạn chế đếm trùng.",
      tech: ["YOLOv8/v11", "ByteTrack", "DeepSORT", "OpenCV"],
      github: "https://github.com/congkcks",
      theme: "livestock",
    },
    {
      name: "English Mentor Buddy",
      description:
        "Ứng dụng trợ lý AI hỗ trợ luyện tiếng Anh, tương tác hội thoại và phản hồi cá nhân hóa.",
      tech: ["ReactJS", "ASP.NET Core", "PostgreSQL", "AI"],
      github: "https://github.com/congkcks/english-mentor-buddy",
      theme: "mentor",
    },
    {
      name: "TOEIC Ace Path 18",
      description:
        "Nền tảng hỗ trợ luyện thi TOEIC với lộ trình học, bài luyện tập và theo dõi tiến độ.",
      tech: ["Web", "Lộ trình học", "Theo dõi tiến độ"],
      github: "https://github.com/congkcks/toeic-ace-path-18",
      theme: "toeic",
    },
    {
      name: "EngAce",
      description:
        "Nền tảng học tiếng Anh đa kỹ năng, tích hợp Gemini API để hỗ trợ luyện tập và phản hồi.",
      tech: ["ASP.NET Core", "ReactJS", "PostgreSQL", "Gemini API"],
      github: null,
      theme: "engace",
    },
    {
      name: "AI-Speaking-Coach",
      description:
        "Ứng dụng luyện nói tiếng Anh thông qua ghi âm, chuyển giọng nói thành văn bản và phân tích phản hồi bằng AI.",
      tech: ["React", "Tailwind CSS", "ASP.NET Core", "Gemini Flash", "Whisper STT"],
      github: null,
      theme: "speaking",
    },
  ],
  whyEnglish: [
    "Là một người yêu thích công nghệ, mình nhận thấy tiếng Anh là một kỹ năng quan trọng để tiếp cận tài liệu chuyên môn, học hỏi kiến thức mới và mở rộng cơ hội phát triển bản thân.",
    "Thay vì chỉ đặt ra mục tiêu rồi bỏ dở, mình muốn ghi lại từng ngày học tập, từ những kiến thức cơ bản đến những điều mới mẻ mình khám phá được.",
    "Website này chính là cuốn nhật ký nhỏ của mình, nơi lưu giữ tài liệu, ghi chú và những bước tiến trên hành trình học tiếng Anh.",
  ],
  hobbies: [
    { name: "Manchester United", description: "Fan Manchester United. GGMU!", icon: "trophy" },
    {
      name: "FC Online",
      description: "Yêu thích bóng đá và xây dựng đội hình trong FC Online.",
      icon: "gamepad",
    },
    { name: "Âm nhạc", description: "Nghe nhạc để thư giãn và tìm cảm hứng.", icon: "music" },
  ],
  socials: {
    github: "https://github.com/congkcks",
    linkedin: "https://www.linkedin.com/in/cong-vu-van-5936463aa/",
    facebook: "https://www.facebook.com/van.vu.cong.761426",
    email: "congvanvu0000@gmail.com",
  },
};
