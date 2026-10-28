const $ = (id) => document.getElementById(id);

const abilityFields = [
  ["ability1", "desc1"],
  ["ability2", "desc2"],
  ["ability3", "desc3"],
  ["ability4", "desc4"]
];

function valueOr(id, fallback) {
  const field = $(id);
  return field ? field.value.trim() || fallback : fallback;
}

function updateCard() {
  $("outName").textContent = valueOr("characterName", "이름 없는 기록자");
  $("outTitle").textContent = valueOr("title", "미등록 칭호");
  $("outPet").textContent = valueOr("petName", "미등록 펫");
  $("outPetDesc").textContent = valueOr("petDesc", "아직 기록된 내용이 없습니다.");

  const abilityBox = $("outAbilities");
  abilityBox.innerHTML = "";

  abilityFields.forEach(([nameId, descId], index) => {
    const name = $(nameId).value.trim();
    const desc = $(descId).value.trim();

    if (!name && !desc) return;

    const item = document.createElement("div");
    item.className = "ability";

    const heading = document.createElement("h4");
    heading.textContent = name || `능력 ${index + 1}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = desc || "설명이 없습니다.";

    item.append(heading, paragraph);
    abilityBox.appendChild(item);
  });
}

// 입력 내용이 바뀌면 도감 갱신
document.querySelectorAll(".editor input, .editor textarea")
  .forEach((field) => {
    if (field.type === "file") return;
    field.addEventListener("input", updateCard);
    field.addEventListener("change", updateCard);
  });

// 가로형 도감 PNG 저장
async function saveCardAsImage() {
  updateCard();

  if (typeof window.html2canvas !== "function") {
    alert("이미지 저장 기능을 불러오지 못했어요.");
    return;
  }

  const card = $("card");
  const buttons = [$("saveImage"), $("saveImageBottom")];

  try {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = true;
        button.textContent = "이미지 만드는 중...";
      }
    });

    const canvas = await window.html2canvas(card, {
      scale: 2,
      backgroundColor: "#100d18",
      logging: false,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.getElementById("card");
        const record = clonedCard?.querySelector(".record");

        if (clonedCard) {
          Object.assign(clonedCard.style, {
            display: "block",
            width: "1200px",
            minWidth: "1200px",
            height: "675px",
            minHeight: "675px",
            maxHeight: "675px",
            overflow: "hidden",
            boxSizing: "border-box"
          });
        }

        if (record) {
          Object.assign(record.style, {
            width: "100%",
            height: "100%",
            minHeight: "0",
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "28px 40px"
          });
        }

        clonedCard?.querySelectorAll("button").forEach((button) => {
          button.style.display = "none";
        });
      }
    });

    const filename = valueOr("characterName", "fantasy-record")
      .replace(/[\\/:*?"<>|]/g, "_");

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("PNG 파일 생성 실패"));
      }, "image/png");
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-도감.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error(error);
    alert("저장 오류: " + error.message);
  } finally {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = false;
        button.textContent = "✧ 이미지 저장";
      }
    });
  }
}

$("saveImage")?.addEventListener("click", saveCardAsImage);
$("saveImageBottom")?.addEventListener("click", saveCardAsImage);

updateCard();

console.log("섀도우 코어가 정상적으로 실행되었습니다.");
