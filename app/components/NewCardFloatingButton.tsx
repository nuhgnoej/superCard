import { Plus } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function NewCardFloatingButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        to="/new"
        className="bg-blue-600 hover:bg-blue-700 text-white 
             w-14 h-14 flex items-center justify-center
             rounded-full shadow-xl 
             transition-all duration-300 ease-in-out hover:scale-110"
        title="새 카드 만들기"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </motion.div>
  );
}