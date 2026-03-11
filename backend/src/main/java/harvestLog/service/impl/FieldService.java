package harvestLog.service.impl;

import harvestLog.dto.FieldRequest;
import harvestLog.dto.FieldResponse;
import harvestLog.exception.AlreadyExistsException;
import harvestLog.model.Farmer;
import harvestLog.model.Field;
import harvestLog.repository.FarmerRepository;
import harvestLog.repository.FieldRepository;
import harvestLog.service.IFieldService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FieldService implements IFieldService {
    private final FieldRepository fieldRepo;
    private final FarmerRepository farmerRepo;

    public FieldService(FieldRepository fieldRepo, FarmerRepository farmerRepo) {
        this.fieldRepo = fieldRepo;
        this.farmerRepo = farmerRepo;
    }

    public List<FieldResponse> getAllForFarmer(Long farmerId) {
        return fieldRepo.findByFarmerId(farmerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FieldResponse> getActiveForFarmer(Long farmerId) {
        return fieldRepo.findByFarmerIdAndActive(farmerId, true).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FieldResponse> getInactiveForFarmer(Long farmerId) {
        return fieldRepo.findByFarmerIdAndActive(farmerId, false).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FieldResponse> getAllForFarmer(Long farmerId, Boolean active) {
        if (active == null) {
            return getAllForFarmer(farmerId);
        }
        return active ? getActiveForFarmer(farmerId) : getInactiveForFarmer(farmerId);
    }

//    ##
    public Optional<FieldResponse> getById(Long id, Long farmerId) {
        return fieldRepo.findById(id)
                .filter(field -> field.getFarmer().getId().equals(farmerId))
                .map(this::toResponse);
    }

    @Transactional
    public FieldResponse create(FieldRequest request, Long farmerId) {
        try {
            Field field = toEntity(request, farmerId);
            Field saved = fieldRepo.save(field);
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            return handleDuplicateField(request, farmerId);
        }
    }

    private FieldResponse handleDuplicateField(FieldRequest request, Long farmerId) {
        Optional<Field> existing = fieldRepo.findByNameIgnoreCaseAndFarmerId(request.name(), farmerId);

        if (existing.isPresent() && !existing.get().isActive()) {
            Field field = existing.get();
            field.setActive(true);
            return toResponse(fieldRepo.save(field));
        }

        throw new AlreadyExistsException("Active field with name '" + request.name() + "' already exists");
    }

    @Transactional
    public Optional<FieldResponse> update(Long id, FieldRequest request, Long farmerId) {
        return fieldRepo.findById(id)
                .filter(field -> field.getFarmer().getId().equals(farmerId))
                .map(field -> {
                    if (request.name() != null) {
                        field.setName(request.name());
                    }
                    if (request.active() != null) {
                        field.setActive(request.active());
                    }
                    return toResponse(fieldRepo.save(field));
                });
    }

    @Transactional
    public boolean delete(Long id, Long farmerId) {
        return fieldRepo.softDeleteByIdInAndFarmerId(List.of(id), farmerId) > 0;
    }

    @Transactional
    public List<FieldResponse> createBatch(List<FieldRequest> requests, Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        List<Field> fields = requests.stream()
                .map(request -> {
                    Field field = new Field();
                    field.setName(request.name());
                    field.setFarmer(farmer);
                    return field;
                })
                .collect(Collectors.toList());

        List<Field> savedFields = fieldRepo.saveAll(fields);
        return savedFields.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public int deleteBatch(List<Long> ids, Long farmerId) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return fieldRepo.softDeleteByIdInAndFarmerId(ids, farmerId);
    }

    private Field toEntity(FieldRequest request, Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));
        Field field = new Field();
        field.setName(request.name());
        field.setFarmer(farmer);
        field.setActive(request.active() != null ? request.active() : true);
        return field;
    }

    private FieldResponse toResponse(Field field) {
        return new FieldResponse(
                field.getId(),
                field.getName(),
                field.getFarmer().getId(),
                field.isActive()
        );
    }
}