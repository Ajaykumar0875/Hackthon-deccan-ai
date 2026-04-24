"""25 richly detailed mock candidate profiles."""
import json
import os

CANDIDATES = [
    {
        "id": "C001",
        "name": "Aarav Mehta",
        "title": "Senior Full Stack Engineer",
        "location": "Bangalore, India",
        "experience_years": 7,
        "experience_level": "Senior",
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "GraphQL", "Redis"],
        "summary": "Passionate full-stack engineer with 7 years building scalable web applications. Led teams of 5-8 engineers at two unicorn startups. Expert in React ecosystem and cloud-native architectures.",
        "education": "B.Tech Computer Science, IIT Bombay",
        "previous_companies": ["Razorpay", "Swiggy", "Infosys"],
        "achievements": [
            "Reduced API response time by 60% using Redis caching",
            "Led migration of monolith to microservices serving 10M users",
            "Open source contributor with 2.1k GitHub stars"
        ],
        "expected_salary_usd": 85000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C002",
        "name": "Priya Sharma",
        "title": "Machine Learning Engineer",
        "location": "Hyderabad, India",
        "experience_years": 5,
        "experience_level": "Mid",
        "skills": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "SQL", "MLflow", "Kubernetes", "FastAPI"],
        "summary": "ML engineer specializing in NLP and computer vision. Built production ML pipelines serving millions of predictions daily. Strong background in both research and engineering.",
        "education": "M.Tech AI/ML, IIT Hyderabad",
        "previous_companies": ["Microsoft", "Flipkart AI Labs"],
        "achievements": [
            "Deployed NLP model reducing customer support tickets by 35%",
            "Published 2 papers at NeurIPS and ICML",
            "Kaggle Grandmaster (top 50 globally)"
        ],
        "expected_salary_usd": 72000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C003",
        "name": "Rohan Verma",
        "title": "DevOps / Platform Engineer",
        "location": "Pune, India",
        "experience_years": 6,
        "experience_level": "Senior",
        "skills": ["Kubernetes", "Terraform", "AWS", "GCP", "Docker", "Jenkins", "Python", "Prometheus", "Grafana"],
        "summary": "Platform engineer with deep expertise in cloud infrastructure and CI/CD pipelines. Built zero-downtime deployment systems for fintech applications handling billions in transactions.",
        "education": "B.E. Information Technology, Pune University",
        "previous_companies": ["Juspay", "Freshworks", "TCS"],
        "achievements": [
            "Reduced infrastructure costs by 40% through spot instance optimization",
            "Achieved 99.99% uptime for payment processing platform",
            "CKA certified Kubernetes administrator"
        ],
        "expected_salary_usd": 78000,
        "open_to_remote": False,
        "availability": "Immediate"
    },
    {
        "id": "C004",
        "name": "Sneha Iyer",
        "title": "Product Manager - AI/ML Products",
        "location": "Mumbai, India",
        "experience_years": 8,
        "experience_level": "Senior",
        "skills": ["Product Strategy", "Data Analysis", "SQL", "A/B Testing", "Roadmapping", "Agile", "User Research", "Python"],
        "summary": "Experienced PM who has shipped 15+ AI-powered products from zero to one. Bridge between technical ML teams and business stakeholders. Strong data intuition with hands-on SQL skills.",
        "education": "MBA IIM Ahmedabad, B.Tech NIT Trichy",
        "previous_companies": ["PhonePe", "Ola", "Zomato"],
        "achievements": [
            "Launched AI-powered fraud detection saving $5M annually",
            "Grew user retention by 28% through ML-driven personalization",
            "Built and scaled product team from 3 to 18 members"
        ],
        "expected_salary_usd": 95000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C005",
        "name": "Arjun Nair",
        "title": "Backend Engineer - Go & Distributed Systems",
        "location": "Chennai, India",
        "experience_years": 5,
        "experience_level": "Mid",
        "skills": ["Go", "Rust", "Kafka", "gRPC", "PostgreSQL", "Redis", "Docker", "AWS", "Elasticsearch"],
        "summary": "Backend specialist in high-throughput distributed systems. Built real-time data pipelines processing 500K events/second. Passionate about performance engineering and low-latency systems.",
        "education": "B.Tech CSE, NIT Calicut",
        "previous_companies": ["Zepto", "Groww"],
        "achievements": [
            "Built event streaming platform processing 500K msgs/sec",
            "Reduced p99 latency from 800ms to 45ms",
            "Speaker at GopherCon India 2024"
        ],
        "expected_salary_usd": 68000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C006",
        "name": "Divya Krishnan",
        "title": "Data Scientist - NLP Specialist",
        "location": "Bangalore, India",
        "experience_years": 4,
        "experience_level": "Mid",
        "skills": ["Python", "NLP", "BERT", "LangChain", "Hugging Face", "SQL", "Spark", "Tableau"],
        "summary": "Data scientist with a focus on NLP and conversational AI. Built chatbots and document intelligence systems for enterprise clients. Strong in both model development and business communication.",
        "education": "M.Sc Statistics, IISc Bangalore",
        "previous_companies": ["IBM Research", "Accenture AI"],
        "achievements": [
            "Built multilingual chatbot serving 2M users across 6 languages",
            "Improved document classification accuracy from 78% to 94%",
            "Led NLP Center of Excellence for 12-person team"
        ],
        "expected_salary_usd": 65000,
        "open_to_remote": True,
        "availability": "Immediate"
    },
    {
        "id": "C007",
        "name": "Karan Malhotra",
        "title": "Frontend Engineer - React & Next.js",
        "location": "Delhi, India",
        "experience_years": 4,
        "experience_level": "Mid",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Jest", "Storybook", "Figma"],
        "summary": "Frontend craftsman obsessed with performance and user experience. Contributed to design systems used by 200+ engineers. Strong in accessibility, animations, and Core Web Vitals optimization.",
        "education": "B.Tech ECE, Delhi Technological University",
        "previous_companies": ["Meesho", "OYO"],
        "achievements": [
            "Improved Lighthouse score from 45 to 98",
            "Built design system adopted across 5 product teams",
            "Reduced bundle size by 55% through code splitting"
        ],
        "expected_salary_usd": 58000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C008",
        "name": "Ananya Gupta",
        "title": "AI Research Engineer",
        "location": "Bangalore, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Python", "PyTorch", "Transformers", "LLM Fine-tuning", "RLHF", "LangChain", "RAG", "Vector DBs"],
        "summary": "AI research engineer working at the intersection of LLMs and product. Experience fine-tuning GPT/Llama models and building RAG pipelines for enterprise use cases. Strong research background.",
        "education": "M.Tech AI, IIIT Hyderabad",
        "previous_companies": ["Google DeepMind (intern)", "Sarvam AI"],
        "achievements": [
            "Fine-tuned LLaMA-3 for legal document summarization",
            "Built RAG system with 89% accuracy on enterprise knowledge base",
            "1st place at AI Hack India 2024"
        ],
        "expected_salary_usd": 70000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C009",
        "name": "Rahul Desai",
        "title": "Data Engineer - AWS & Spark",
        "location": "Pune, India",
        "experience_years": 6,
        "experience_level": "Senior",
        "skills": ["Apache Spark", "AWS Glue", "Redshift", "Airflow", "Python", "dbt", "Kafka", "Snowflake"],
        "summary": "Data engineer building reliable, scalable data platforms. Designed and implemented data lakes processing 10TB+ daily. Expert in modern data stack including dbt, Airflow, and Snowflake.",
        "education": "B.E. CS, VIT Pune",
        "previous_companies": ["Myntra", "Paytm", "Wipro"],
        "achievements": [
            "Built data lake processing 10TB/day for analytics team",
            "Reduced ETL pipeline failures by 90%",
            "Migrated legacy Oracle DW to Snowflake saving $800K/year"
        ],
        "expected_salary_usd": 74000,
        "open_to_remote": False,
        "availability": "1 month"
    },
    {
        "id": "C010",
        "name": "Meera Joshi",
        "title": "Security Engineer",
        "location": "Bangalore, India",
        "experience_years": 5,
        "experience_level": "Senior",
        "skills": ["Penetration Testing", "AWS Security", "OWASP", "SIEM", "Python", "Burp Suite", "Terraform", "SOC2"],
        "summary": "Security engineer with deep expertise in cloud security and application penetration testing. Helped 10+ startups achieve SOC2 compliance. Former CTF champion.",
        "education": "B.Tech CSE, BITS Pilani",
        "previous_companies": ["CloudSEK", "Razorpay Security"],
        "achievements": [
            "Identified critical RCE vulnerabilities in 3 unicorn platforms",
            "Led SOC2 Type II certification for 3 organizations",
            "OSCP and CISSP certified"
        ],
        "expected_salary_usd": 80000,
        "open_to_remote": True,
        "availability": "Immediate"
    },
    {
        "id": "C011",
        "name": "Vikram Patel",
        "title": "Android Engineer",
        "location": "Ahmedabad, India",
        "experience_years": 5,
        "experience_level": "Senior",
        "skills": ["Kotlin", "Jetpack Compose", "Android SDK", "Room", "Coroutines", "Hilt", "Firebase", "Retrofit"],
        "summary": "Android engineer with 5 years building consumer and enterprise apps with millions of downloads. Strong in modern Android architecture patterns and performance optimization.",
        "education": "B.Tech IT, DAIICT",
        "previous_companies": ["CRED", "Ola Electric"],
        "achievements": [
            "Built CRED's rewards UI serving 8M active users",
            "Reduced app crash rate from 3.2% to 0.1%",
            "App featured in Google Play Best of 2023"
        ],
        "expected_salary_usd": 62000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C012",
        "name": "Lakshmi Rao",
        "title": "iOS Engineer",
        "location": "Hyderabad, India",
        "experience_years": 6,
        "experience_level": "Senior",
        "skills": ["Swift", "SwiftUI", "Objective-C", "Core Data", "Combine", "XCTest", "Firebase", "AVFoundation"],
        "summary": "iOS engineer passionate about crafting beautiful, performant mobile experiences. Built apps with 50M+ total downloads. Expert in SwiftUI and reactive programming with Combine.",
        "education": "B.Tech CSE, Osmania University",
        "previous_companies": ["ShareChat", "Hotstar"],
        "achievements": [
            "Shipped video streaming module for 30M MAU app",
            "Reduced app binary size by 40% through asset optimization",
            "Apple WWDC scholarship winner"
        ],
        "expected_salary_usd": 67000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C013",
        "name": "Suresh Kumar",
        "title": "Site Reliability Engineer (SRE)",
        "location": "Bangalore, India",
        "experience_years": 7,
        "experience_level": "Senior",
        "skills": ["SRE", "Kubernetes", "Prometheus", "Grafana", "Python", "Go", "PagerDuty", "Chaos Engineering"],
        "summary": "SRE focused on availability, scalability, and operational excellence. Defined and enforced SLOs/SLAs for systems serving 50M users. Expert in chaos engineering and incident response.",
        "education": "B.E. ECE, Anna University",
        "previous_companies": ["Zoho", "Freshworks", "Amazon"],
        "achievements": [
            "Maintained 99.999% uptime for payment gateway",
            "Reduced MTTR from 45 min to 8 min through better observability",
            "Implemented chaos engineering practice adopted company-wide"
        ],
        "expected_salary_usd": 88000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C014",
        "name": "Pooja Agarwal",
        "title": "UX / Product Designer",
        "location": "Bangalore, India",
        "experience_years": 5,
        "experience_level": "Senior",
        "skills": ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing", "Framer", "Accessibility"],
        "summary": "Product designer with a track record of shipping user-centered designs at scale. Led UX for products used by 20M+ users. Specializes in complex data-heavy dashboards and mobile-first design.",
        "education": "B.Des Visual Communication, NID Ahmedabad",
        "previous_companies": ["Navi", "Dunzo", "Thoughtworks"],
        "achievements": [
            "Redesigned checkout flow increasing conversion by 22%",
            "Won Red Dot Design Award 2023",
            "Built design system with 150+ components"
        ],
        "expected_salary_usd": 65000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C015",
        "name": "Aditya Bansal",
        "title": "Blockchain / Web3 Engineer",
        "location": "Delhi, India",
        "experience_years": 4,
        "experience_level": "Mid",
        "skills": ["Solidity", "Rust", "Ethereum", "Hardhat", "React", "TypeScript", "The Graph", "IPFS"],
        "summary": "Web3 engineer building DeFi protocols and NFT infrastructure. Deep expertise in Solidity and EVM-compatible chains. Also strong in frontend Web3 integrations with ethers.js and wagmi.",
        "education": "B.Tech CS, Delhi University",
        "previous_companies": ["CoinDCX", "Polygon Labs"],
        "achievements": [
            "Audited smart contracts securing $50M+ in TVL",
            "Built DEX protocol with $5M daily trading volume",
            "ETHIndia 2023 hackathon winner"
        ],
        "expected_salary_usd": 75000,
        "open_to_remote": True,
        "availability": "Immediate"
    },
    {
        "id": "C016",
        "name": "Neha Saxena",
        "title": "Technical Lead - Java / Spring Boot",
        "location": "Noida, India",
        "experience_years": 9,
        "experience_level": "Lead",
        "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL", "Redis", "AWS", "JUnit", "Maven"],
        "summary": "Technical lead with 9 years in enterprise Java development. Led architecture decisions for banking and insurance platforms. Strong in designing fault-tolerant microservices and mentoring junior engineers.",
        "education": "MCA, Symbiosis Institute, Pune",
        "previous_companies": ["HDFC Bank Tech", "Mphasis", "Cognizant"],
        "achievements": [
            "Architected core banking microservices for 5M customers",
            "Reduced system downtime by 70% through circuit breakers",
            "Mentored 25+ engineers, 8 promoted to senior roles"
        ],
        "expected_salary_usd": 90000,
        "open_to_remote": False,
        "availability": "1 month"
    },
    {
        "id": "C017",
        "name": "Ravi Shankar",
        "title": "Full Stack Engineer - Python & React",
        "location": "Kolkata, India",
        "experience_years": 3,
        "experience_level": "Junior",
        "skills": ["Python", "Django", "React", "PostgreSQL", "Docker", "Celery", "Redis", "REST APIs"],
        "summary": "Energetic full-stack engineer who ships fast and learns faster. Built multiple SaaS products end-to-end. Strong in Python/Django backend and React frontend. Passionate about clean code and testing.",
        "education": "B.Tech CSE, Jadavpur University",
        "previous_companies": ["Recko", "Clevertap"],
        "achievements": [
            "Built billing engine processing 100K invoices/month",
            "100% test coverage on payment module",
            "Side project SaaS reached $5K MRR in 6 months"
        ],
        "expected_salary_usd": 42000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C018",
        "name": "Deepa Menon",
        "title": "Cloud Architect - GCP & Azure",
        "location": "Trivandrum, India",
        "experience_years": 10,
        "experience_level": "Principal",
        "skills": ["GCP", "Azure", "Terraform", "Kubernetes", "Python", "Solution Architecture", "BigQuery", "Pub/Sub"],
        "summary": "Cloud architect helping enterprises modernize to cloud-native. 10 years designing multi-cloud solutions for Fortune 500 clients. 12 active cloud certifications. Strong at cost optimization and governance.",
        "education": "B.Tech CSE, Kerala University + AWS/GCP Certifications",
        "previous_companies": ["Google Cloud PS", "Wipro Technologies", "EY"],
        "achievements": [
            "Migrated 500-node on-prem cluster to GCP saving $2M/year",
            "Designed multi-cloud DR strategy with RPO < 30 seconds",
            "12 cloud certifications across AWS, GCP, Azure"
        ],
        "expected_salary_usd": 110000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C019",
        "name": "Siddharth Rao",
        "title": "GenAI / LLM Engineer",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Python", "LangChain", "OpenAI API", "Gemini", "RAG", "Pinecone", "FastAPI", "Prompt Engineering"],
        "summary": "Focused GenAI engineer building production LLM applications. Shipped 5 AI products using LangChain and various LLM providers. Deep expertise in RAG architectures and prompt optimization.",
        "education": "B.Tech CS, PES University",
        "previous_companies": ["Sarvam AI", "startup (co-founded)"],
        "achievements": [
            "Built legal AI assistant reducing contract review time by 70%",
            "Prompt optimization improved response quality by 40%",
            "1st at Google GenAI Hackathon India 2024"
        ],
        "expected_salary_usd": 55000,
        "open_to_remote": True,
        "availability": "Immediate"
    },
    {
        "id": "C020",
        "name": "Kavya Reddy",
        "title": "Principal Data Scientist",
        "location": "Hyderabad, India",
        "experience_years": 11,
        "experience_level": "Principal",
        "skills": ["Python", "R", "Machine Learning", "Deep Learning", "Statistics", "SQL", "Spark", "Leadership"],
        "summary": "Principal data scientist with 11 years applying ML to business problems across retail, fintech, and healthcare. Known for bridging the gap between business strategy and technical execution.",
        "education": "Ph.D Statistics, University of Hyderabad",
        "previous_companies": ["Amazon", "Walmart Labs", "Apollo Hospitals AI"],
        "achievements": [
            "Built ML model detecting early-stage diabetes with 91% accuracy",
            "Led 20-person data science team across 3 countries",
            "Published 8 peer-reviewed papers in ML conferences"
        ],
        "expected_salary_usd": 120000,
        "open_to_remote": True,
        "availability": "2 months"
    },
    {
        "id": "C021",
        "name": "Amit Jain",
        "title": "QA Engineer - Automation",
        "location": "Jaipur, India",
        "experience_years": 4,
        "experience_level": "Mid",
        "skills": ["Selenium", "Cypress", "Python", "Java", "Playwright", "REST API Testing", "JMeter", "TestRail"],
        "summary": "QA automation engineer building robust test frameworks from scratch. Reduced manual testing effort by 80% at two companies. Strong in both UI automation and API testing.",
        "education": "B.Tech CSE, Manipal University",
        "previous_companies": ["Postman", "BrowserStack"],
        "achievements": [
            "Built E2E automation suite with 2000+ tests running in CI",
            "Reduced regression cycle from 3 days to 2 hours",
            "Zero-defect release for 6 consecutive quarters"
        ],
        "expected_salary_usd": 48000,
        "open_to_remote": True,
        "availability": "2 weeks"
    },
    {
        "id": "C022",
        "name": "Preethi Subramanian",
        "title": "Engineering Manager",
        "location": "Bangalore, India",
        "experience_years": 12,
        "experience_level": "Lead",
        "skills": ["Engineering Leadership", "Agile", "System Design", "Python", "Java", "Hiring", "OKRs", "Technical Strategy"],
        "summary": "Engineering manager with 12 years in tech, 5 as EM. Built and scaled teams from 5 to 40 engineers. Strong technical background with IC experience at Google and Atlassian. Passionate about engineering culture.",
        "education": "M.S. CS, Carnegie Mellon University",
        "previous_companies": ["Google", "Atlassian", "Razorpay"],
        "achievements": [
            "Scaled engineering org from 8 to 40 in 18 months",
            "Improved team velocity by 3x through process improvements",
            "0 → 1 product shipped generating $10M ARR in year one"
        ],
        "expected_salary_usd": 130000,
        "open_to_remote": True,
        "availability": "1 month"
    },
    {
        "id": "C023",
        "name": "Harish Pillai",
        "title": "Embedded Systems Engineer",
        "location": "Kochi, India",
        "experience_years": 6,
        "experience_level": "Senior",
        "skills": ["C", "C++", "RTOS", "Linux Kernel", "ARM Cortex", "CAN Bus", "AUTOSAR", "Python"],
        "summary": "Embedded systems engineer specializing in automotive and IoT firmware. Expert in real-time operating systems and low-level hardware programming. AUTOSAR certified.",
        "education": "B.Tech Electronics, NIT Calicut",
        "previous_companies": ["Bosch India", "Continental", "Tata Elxsi"],
        "achievements": [
            "Developed ADAS firmware deployed in 200K vehicles",
            "Reduced boot time by 40% for infotainment system",
            "Patent holder for adaptive cruise control algorithm"
        ],
        "expected_salary_usd": 72000,
        "open_to_remote": False,
        "availability": "2 months"
    },
    {
        "id": "C024",
        "name": "Tanvi Shah",
        "title": "Growth / Marketing Data Analyst",
        "location": "Mumbai, India",
        "experience_years": 3,
        "experience_level": "Junior",
        "skills": ["SQL", "Python", "Google Analytics", "Mixpanel", "Looker", "A/B Testing", "Excel", "Amplitude"],
        "summary": "Data analyst at the intersection of marketing and data science. Specializes in funnel analysis, cohort analysis, and attribution modeling for growth teams at high-growth startups.",
        "education": "B.Sc Statistics, Mumbai University",
        "previous_companies": ["Wakefit", "Lenskart"],
        "achievements": [
            "Identified growth loop that increased D30 retention by 18%",
            "Built self-serve analytics dashboard for marketing team",
            "A/B tested 40+ experiments driving $2M incremental revenue"
        ],
        "expected_salary_usd": 38000,
        "open_to_remote": True,
        "availability": "Immediate"
    },
    {
        "id": "C025",
        "name": "Farhan Qureshi",
        "title": "Backend Engineer - Node.js & Serverless",
        "location": "Bangalore, India",
        "experience_years": 4,
        "experience_level": "Mid",
        "skills": ["Node.js", "TypeScript", "AWS Lambda", "DynamoDB", "SQS", "API Gateway", "Serverless Framework", "GraphQL"],
        "summary": "Backend engineer who loves serverless architectures and event-driven systems. Built highly scalable APIs serving millions of requests with sub-100ms p99 latency. AWS Certified Solutions Architect.",
        "education": "B.Tech IT, NMIT Bangalore",
        "previous_companies": ["Urban Company", "Slice"],
        "achievements": [
            "Built serverless API handling 1M+ requests/day at $0.03/1K req",
            "Reduced API latency by 70% using edge caching",
            "AWS Certified Solutions Architect - Professional"
        ],
        "expected_salary_usd": 60000,
        "open_to_remote": True,
        "availability": "2 weeks"
    }
]


def get_all_candidates() -> list[dict]:
    """Return all candidate profiles."""
    return CANDIDATES


def get_candidate_by_id(candidate_id: str) -> dict | None:
    """Return a specific candidate by ID."""
    return next((c for c in CANDIDATES if c["id"] == candidate_id), None)


SAMPLE_JDS = [
    {
        "title": "Senior Full Stack Engineer",
        "text": """We are looking for a Senior Full Stack Engineer to join our growing team. 

Role: Senior Full Stack Engineer
Experience Required: 5+ years

Required Skills:
- React or Next.js (expert level)
- Node.js or Python backend development  
- PostgreSQL or similar relational database
- AWS or GCP cloud services
- Docker and container orchestration
- TypeScript

Preferred Skills:
- GraphQL
- Redis caching
- Microservices architecture
- Team leadership experience

Responsibilities:
- Design and build scalable web applications
- Collaborate with product and design teams
- Code reviews and mentoring junior engineers
- Drive technical decisions

We offer competitive salary ($70K-$90K), remote-first culture, and equity."""
    },
    {
        "title": "Machine Learning Engineer",
        "text": """We're hiring a Machine Learning Engineer to build production AI systems.

Role: ML Engineer
Experience: 3-6 years

Required Skills:
- Python (expert)
- TensorFlow or PyTorch
- NLP and text processing
- MLOps and model deployment
- SQL and data pipelines

Preferred Skills:
- LLM fine-tuning
- Hugging Face ecosystem
- Kubernetes for ML workloads
- FastAPI or Flask

The ideal candidate has deployed models serving millions of predictions and understands the full ML lifecycle from experimentation to production.

Compensation: $65K-$80K + equity"""
    },
    {
        "title": "GenAI / LLM Engineer",
        "text": """Cutting-edge AI startup hiring a GenAI Engineer to build next-gen AI products.

Role: GenAI Engineer
Experience: 1-4 years

Required Skills:
- Python
- LangChain or similar agent frameworks
- OpenAI API / Gemini / Claude
- RAG architectures
- Vector databases (Pinecone, ChromaDB)
- FastAPI

Preferred Skills:
- LLM fine-tuning (LoRA, QLoRA)
- Prompt engineering expertise
- React frontend basics
- MLOps

You'll be building AI-powered applications from scratch in a fast-paced environment. We value curiosity, speed, and shipping.

Comp: $50K-$75K + meaningful equity"""
    }
]
