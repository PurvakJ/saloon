export default function SlotCard({ slot, onBook }) {

    const isFull = slot.available <= 0;
  
    return (
  
      <div style={{
        border: "1px solid #ddd",
        padding: "15px",
        marginBottom: "10px",
        borderRadius: "6px"
      }}>
  
        <h4>{slot.date}</h4>
  
        <p>
          {slot.start} - {slot.end}
        </p>
  
        <p>
          Chairs Available: {slot.available} / {slot.chairs}
        </p>
  
        {isFull ? (
          <span style={{color:"red"}}>
            Slot Booked
          </span>
        ) : (
          <button onClick={() => onBook(slot.slotId)}>
            Book Appointment
          </button>
        )}
  
      </div>
  
    );
  }