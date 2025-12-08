import MuscleGroup from "../models/muscleGroup.model.js";

export const getAllMuscles = async(req, res) => {
    try {
        const muscles = await MuscleGroup.findAll({
            attributes: ['muscle_group_id', 'name', 'name_en'],
            order: [['name', 'ASC']],
        });

        const data = muscles.map( m => ({
            id: m.muscle_group_id,
            name: `${m.name} (${m.name_en})`
        }));

        res.json({success: true, data});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Lỗi không tìm thấy nhóm cơ muslces"});
    }
 }