import React, { useState, useEffect } from "react";

// 교육 목차 데이터
const topics = [
  {
    id: "personal-data",
    title: "개인정보 보호의 중요성",
    description:
      "개인정보가 왜 중요한지 이해하고, 우리 조합원들의 정보를 안전하게 지키는 방법을 알아봅니다.",
  },
  {
    id: "malware-virus",
    title: "악성코드 및 바이러스 대응",
    description:
      "컴퓨터와 시스템을 위협하는 다양한 악성코드의 종류와 감염을 막는 방법을 배웁니다.",
  },
  {
    id: "phishing-smishing",
    title: "피싱/스미싱 공격 이해",
    description:
      "이메일, 문자를 통한 사기 수법을 파악하고, 속지 않는 요령을 익힙니다.",
  },
  {
    id: "password-management",
    title: "안전한 비밀번호 관리",
    description:
      "강력한 비밀번호의 조건과 효율적인 비밀번호 관리법을 알아봅니다.",
  },
  {
    id: "network-security",
    title: "네트워크 보안의 기본",
    description:
      "우리 조합 내부 네트워크를 안전하게 사용하는 기본 원칙들을 살펴봅니다.",
  },
  {
    id: "recent-incidents",
    title: "최신 보안 사고 사례 분석",
    description:
      "2020년 이후 발생한 주요 기업의 해킹 사고를 통해 피해 규모와 원인을 분석합니다.",
  },
  {
    id: "cloud-security",
    title: "클라우드 서비스 보안",
    description:
      "클라우드 환경에서 발생할 수 있는 보안 취약점과 안전한 사용법을 알아봅니다.",
  },
  {
    id: "info-protection-laws",
    title: "정보보호 관련 법규 및 정책",
    description:
      "개인정보보호법 등 우리 조합이 준수해야 할 주요 법규를 알아봅니다.",
  },
  {
    id: "social-engineering",
    title: "사회공학적 공격",
    description:
      "사람의 심리를 이용하는 해킹 기법을 이해하고, 어떻게 방어해야 하는지 알아봅니다.",
  },
  {
    id: "security-awareness",
    title: "보안 인식 제고 및 행동 수칙",
    description:
      "일상 업무에서 실천할 수 있는 보안 습관과 위기 시 대응 방안을 정리합니다.",
  },
];

// 막대 차트 컴포넌트
const BarChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartHeight = 200;
  const barWidth = 40;
  const maxVal = Math.max(...data.map((d) => d.value));
  const svgWidth = data.length * (barWidth + 20) + 20;

  return (
    <div className="flex justify-center my-8">
      <svg width={svgWidth} height={chartHeight + 30}>
        {/* 막대 */}
        {data.map((d, index) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          const x = index * (barWidth + 20) + 10;
          const y = chartHeight - barHeight;
          return (
            <React.Fragment key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#065f46"
                rx="5"
                ry="5"
              />
              {/* 막대 위 값 */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fill="#1f2937"
                fontSize="12"
                fontWeight="bold"
              >
                {d.value}
              </text>
              {/* 막대 아래 라벨 */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
              >
                {d.label}
              </text>
            </React.Fragment>
          );
        })}
        {/* 가로선 */}
        <line
          x1="0"
          y1={chartHeight}
          x2={svgWidth}
          y2={chartHeight}
          stroke="#d1d5db"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

// 메인 앱 컴포넌트
const App = () => {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 주제에 대한 콘텐츠를 LLM API에서 가져오는 함수
  const fetchTopicContent = async (topicId) => {
    setIsLoading(true);
    setError(null);
    setContent(null);

    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;

    // 한국어로 프롬프트 정의
    const prompt = `
      ${topic.title}에 대한 전산시스템 보안 교육 자료를 작성해줘. 
      다음 구조에 맞게 JSON 형식으로 응답해줘:
      1.  **summary**: ${topic.title}에 대한 간결한 한두 문단 요약.
      2.  **news**: 2020년 이후에 발생한 ${topic.title} 관련 뉴스 2~3개. 각 뉴스는 'title', 'summary', 'url' 필드를 포함해야 해.
      3.  **imageQuery**: ${topic.title}과 관련하여 구글 이미지 검색에 사용할 한글 쿼리.
      4.  **chartData**: ${topic.title} 관련 통계나 데이터를 바탕으로 3~4개의 { "label": "항목명", "value": 숫자 } 형태의 객체 배열을 만들어줘.
      
      만약 주제가 '최신 보안 사고 사례 분석'이라면, 실제 발생한 사건과 피해 규모를 구체적으로 포함시켜줘.
    `;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

    // JSON 응답 스키마 정의
    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING" },
          news: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                summary: { type: "STRING" },
                url: { type: "STRING" },
              },
            },
          },
          imageQuery: { type: "STRING" },
          chartData: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING" },
                value: { type: "NUMBER" },
              },
            },
          },
        },
      },
    };

    // 지수 백오프를 사용한 API 호출
    const maxRetries = 3;
    let retries = 0;

    const callApi = async () => {
      try {
        const payload = { contents: chatHistory, generationConfig };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0
        ) {
          const jsonText = result.candidates[0].content.parts[0].text;
          const parsedData = JSON.parse(jsonText);
          setContent(parsedData);
        } else {
          throw new Error("Failed to get content from the API.");
        }
      } catch (e) {
        if (retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          console.error(`Retrying in ${delay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          await callApi(); // 재귀적 재시도
        } else {
          console.error("API call failed after multiple retries.", e);
          setError(
            "내용을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    callApi();
  };

  useEffect(() => {
    if (selectedTopic) {
      fetchTopicContent(selectedTopic.id);
    }
  }, [selectedTopic]);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 min-h-screen p-8 flex flex-col md:flex-row gap-8">
      {/* 사이드바 - 목차 리스트 */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl rounded-2xl p-6 h-fit sticky top-8">
        <h1 className="text-3xl font-extrabold text-green-800 mb-6 border-b pb-4">
          보안 교육 목차
        </h1>
        <div className="flex flex-col space-y-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className={`text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                selectedTopic?.id === topic.id
                  ? "bg-green-700 text-white font-bold shadow-xl"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            >
              <h2 className="text-xl font-semibold mb-1">{topic.title}</h2>
              <p
                className={`text-sm ${
                  selectedTopic?.id === topic.id
                    ? "text-gray-200"
                    : "text-gray-500"
                }`}
              >
                {topic.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-green-900 mb-6">
          {selectedTopic?.title}
        </h1>
        <hr className="mb-8" />

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-10 w-10 text-green-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="ml-4 text-lg text-gray-600">
              내용을 불러오는 중입니다...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {content && !isLoading && (
          <div className="space-y-12">
            {/* 요약 */}
            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-700">
              <h2 className="text-2xl font-bold text-green-900 mb-3">개요</h2>
              <p className="text-lg leading-relaxed text-gray-700">
                {content.summary}
              </p>
            </div>

            {/* 뉴스 */}
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                최신 뉴스 및 사례
              </h2>
              <div className="space-y-4">
                {content.news &&
                  content.news.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-100 rounded-xl shadow-sm"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-green-700 hover:underline"
                      >
                        {item.title}
                      </a>
                      <p className="mt-1 text-gray-600">{item.summary}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* 이미지 */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                관련 이미지
              </h2>
              <div className="bg-gray-100 p-2 rounded-xl shadow-md">
                <img
                  src={`https://placehold.co/600x400/bbf7d0/15803d?text=${content.imageQuery}`}
                  alt={content.imageQuery}
                  className="rounded-lg shadow-inner"
                />
              </div>
            </div>

            {/* 차트 */}
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                주요 통계
              </h2>
              <BarChart data={content.chartData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
